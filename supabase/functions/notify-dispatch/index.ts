// supabase/functions/notify-dispatch/index.ts
// 알림톡(Bizppurio) 1순위 → 실패 시 SMS(Aligo) 폴백 (ADR-004, ADR-008)
//
// 호출자: pg-boss 워커 (verify_jwt=false, 서비스 롤 키로 Supabase 접근)
// 폴백 트리거: Bizppurio 응답 코드 R001(차단) · R002(수신거부) · T001(타임아웃)
// 재시도: pg-boss retry_limit=4, backoff 15s/1m/5m/15m (pg-boss 측 설정)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// ─── 타입 ─────────────────────────────────────────────────────────────
interface NotifyJob {
  templateId: string;
  userId: string;
  phoneE164: string;         // "+821012345678"
  variables: Record<string, string | number>;
  // 템플릿 본문 (Bizppurio 실패 시 SMS 본문으로 렌더링)
  smsBody?: string;
}

interface NotifyResponse {
  ok: boolean;
  channelUsed: "alimtalk" | "sms" | "none";
  fallback: boolean;
  providerMsgId?: string;
  errorCode?: string;
  errorMessage?: string;
}

interface ChannelResult {
  ok: boolean;
  providerMsgId?: string;
  errorCode?: string;
  errorMessage?: string;
}

// ─── Bizppurio AlimTalk ───────────────────────────────────────────────
// Docs: https://www.bizppurio.com/main/api
// Auth: Basic (bzId + API_KEY → base64)
// Endpoint: POST https://api.bizppurio.com/v3/message
async function sendAlimtalk(job: NotifyJob): Promise<ChannelResult> {
  const bzId = Deno.env.get("BIZPPURIO_ACCOUNT_ID");
  const apiKey = Deno.env.get("BIZPPURIO_API_KEY");
  const senderKey = Deno.env.get("BIZPPURIO_SENDER_KEY");
  if (!bzId || !apiKey || !senderKey) {
    return { ok: false, errorCode: "CONFIG", errorMessage: "Bizppurio env missing" };
  }

  const auth = btoa(`${bzId}:${apiKey}`);
  const phone = job.phoneE164.replace(/^\+82/, "0").replace(/[^0-9]/g, "");

  // 템플릿 변수 치환: {{name}} → 변수 값
  const bodyText = renderTemplate(job.templateId, job.variables);

  const payload = {
    account: bzId,
    refkey: `${job.userId}-${Date.now()}`,
    type: "at",            // at = 알림톡
    from: Deno.env.get("BIZPPURIO_SENDER_NUMBER") ?? "",
    to: phone,
    content: {
      at: {
        senderkey: senderKey,
        templatecode: job.templateId,
        message: bodyText,
      },
    },
  };

  try {
    const res = await fetch("https://api.bizppurio.com/v3/message", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Bizppurio HTTP 4xx/5xx → 시스템 오류. 폴백 대상은 응답 code 기반.
      return {
        ok: false,
        errorCode: `HTTP_${res.status}`,
        errorMessage: text.slice(0, 200),
      };
    }

    const data = (await res.json()) as { code?: string; messagekey?: string; description?: string };
    if (data.code === "1000" || data.code === "success") {
      return { ok: true, providerMsgId: data.messagekey };
    }

    // 응답 코드가 R001/R002/T001 → 폴백 필요 (호출부에서 판단)
    return {
      ok: false,
      errorCode: data.code,
      errorMessage: data.description,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 네트워크 타임아웃 → T001로 정규화 (폴백 대상)
    const errorCode = msg.includes("timed out") || msg.includes("timeout") ? "T001" : "NETWORK";
    return { ok: false, errorCode, errorMessage: msg };
  }
}

// ─── Aligo SMS ────────────────────────────────────────────────────────
// Docs: https://smartsms.aligo.in/admin/api/spec.html
// Endpoint: POST https://apis.aligo.in/send/
async function sendSms(job: NotifyJob): Promise<ChannelResult> {
  const aligoKey = Deno.env.get("ALIGO_API_KEY");
  const aligoUserId = Deno.env.get("ALIGO_USER_ID");
  const aligoSender = Deno.env.get("ALIGO_SENDER_NUMBER");
  if (!aligoKey || !aligoUserId || !aligoSender) {
    return { ok: false, errorCode: "CONFIG", errorMessage: "Aligo env missing" };
  }

  const phone = job.phoneE164.replace(/^\+82/, "0").replace(/[^0-9]/g, "");
  const msg = job.smsBody ?? renderTemplate(job.templateId, job.variables);

  // Aligo는 application/x-www-form-urlencoded 요구
  const form = new URLSearchParams({
    key: aligoKey,
    user_id: aligoUserId,
    sender: aligoSender,
    receiver: phone,
    msg: msg.slice(0, 90), // 단문 SMS 90바이트 제한 (LMS로 자동 승격되지만 보수적으로)
    testmode_yn: Deno.env.get("ALIGO_TESTMODE") === "1" ? "Y" : "N",
  });

  try {
    const res = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await res.json()) as {
      result_code?: string;
      message?: string;
      msg_id?: string;
    };

    // Aligo result_code: "1" = 성공, 음수 = 실패
    if (data.result_code === "1") {
      return { ok: true, providerMsgId: data.msg_id };
    }
    return {
      ok: false,
      errorCode: data.result_code ?? "UNKNOWN",
      errorMessage: data.message,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errorCode: "NETWORK", errorMessage: msg };
  }
}

// ─── 템플릿 렌더러 ─────────────────────────────────────────────────────
// 실 운영 시 Supabase `notify_templates` 테이블에서 body 조회하도록 교체
const TEMPLATE_BODIES: Record<string, string> = {
  ILGAM_M001: "[일감] {{name}}님, {{job_title}} 매칭이 확정되었습니다. {{shift_date}} {{start_time}} 도착.",
  ILGAM_M002: "[일감] {{name}}님, 잠시 후 {{start_time}}에 근무가 시작됩니다. 현장 도착 후 앱에서 출근 체크해주세요.",
  ILGAM_M003: "[일감] {{name}}님, 오늘 근무 {{net_amount}}원이 입금되었습니다.",
  ILGAM_M004: "[일감] {{biz_name}}, {{job_title}}에 신규 지원자가 접수되었습니다.",
  ILGAM_M005: "[일감] {{biz_name}}, {{worker_name}}님의 근무가 종료되었습니다. 승인해주세요.",
  ILGAM_M006: "[일감] 문의 {{ticket_id}}이(가) 처리되었습니다: {{summary}}",
};

function renderTemplate(templateId: string, vars: Record<string, string | number>): string {
  const body = TEMPLATE_BODIES[templateId] ?? `[일감] 알림 (${templateId})`;
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined ? String(v) : `{{${key}}}`;
  });
}

// ─── 폴백 판단 ─────────────────────────────────────────────────────────
const FALLBACK_CODES = new Set(["R001", "R002", "T001"]);
function shouldFallbackToSms(errorCode: string | undefined): boolean {
  return !!errorCode && FALLBACK_CODES.has(errorCode);
}

// ─── 메인 핸들러 ──────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let job: NotifyJob;
  try {
    job = (await req.json()) as NotifyJob;
  } catch {
    return Response.json({ ok: false, errorCode: "BAD_REQUEST" } as NotifyResponse, {
      status: 400,
    });
  }

  // 필수 필드 검증
  if (!job.templateId || !job.phoneE164 || !job.userId) {
    return Response.json({ ok: false, errorCode: "MISSING_FIELD" } as NotifyResponse, {
      status: 400,
    });
  }

  // 1차: AlimTalk
  const at = await sendAlimtalk(job);
  if (at.ok) {
    return Response.json({
      ok: true,
      channelUsed: "alimtalk",
      fallback: false,
      providerMsgId: at.providerMsgId,
    } as NotifyResponse);
  }

  // 2차: 폴백 조건 시 SMS
  if (shouldFallbackToSms(at.errorCode)) {
    const sms = await sendSms(job);
    return Response.json({
      ok: sms.ok,
      channelUsed: sms.ok ? "sms" : "none",
      fallback: true,
      providerMsgId: sms.providerMsgId,
      errorCode: sms.ok ? at.errorCode : sms.errorCode,
      errorMessage: sms.ok ? undefined : sms.errorMessage,
    } as NotifyResponse, {
      status: sms.ok ? 200 : 502,
    });
  }

  // 폴백 대상 아닌 실패 → 상위(pg-boss)에서 재시도 판단
  return Response.json({
    ok: false,
    channelUsed: "none",
    fallback: false,
    errorCode: at.errorCode,
    errorMessage: at.errorMessage,
  } as NotifyResponse, { status: 502 });
});

// ─── 테스트용 export (Deno test에서 import) ───────────────────────────
export { renderTemplate, shouldFallbackToSms, FALLBACK_CODES };
