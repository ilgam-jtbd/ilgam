// supabase/functions/notify-dispatch/index.ts
// 알림톡 1순위 → 실패 시 SMS 폴백 (ADR-004, ADR-008)
// 템플릿 ID: ILGAM_M001~M006 (kakao_alimtalk_templates_v1.md)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface NotifyJob {
  templateId: string;                      // e.g. "ILGAM_M001"
  userId: string;                          // profiles.id
  phoneE164: string;                       // +8210xxxxxxxx
  variables: Record<string, string | number>;
}

// Bizppurio 알림톡 발송 (https://bizppurio.com 문서 기준)
async function sendAlimtalk(
  job: NotifyJob,
): Promise<{ ok: boolean; errorCode?: string; msgId?: string }> {
  const apiKey = Deno.env.get("KAKAO_ALIMTALK_API_KEY");
  const senderKey = Deno.env.get("KAKAO_SENDER_KEY"); // @일감ILGAM 채널 키
  if (!apiKey || !senderKey) return { ok: false, errorCode: "CONFIG" };

  // 변수 누락 방어: 빈 문자열 대체
  const safeVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(job.variables)) {
    safeVars[k] = String(v ?? "");
  }

  const payload = {
    type: "at",              // 알림톡
    profile_key: senderKey,
    template_code: job.templateId,
    msg_type: "AT",
    phone: job.phoneE164.replace(/^\+82/, "0"),  // Bizppurio는 0으로 시작하는 국내 번호
    message: "",             // 서버측 템플릿 치환 (template_code + button 기반)
    button_type: "WL",
    replace_code: safeVars,
    reserved_time: "",       // 즉시 발송
    title: "",
    callback: "",
  };

  try {
    const res = await fetch("https://api.bizppurio.com/v3/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${apiKey}:`)}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.code !== "1000") {
      return { ok: false, errorCode: data.code ?? String(res.status) };
    }
    return { ok: true, msgId: data.msgid };
  } catch (err) {
    console.error("sendAlimtalk error", err);
    return { ok: false, errorCode: "NETWORK" };
  }
}

// SMS 폴백 (알리고 API 기준)
async function sendSms(
  job: NotifyJob,
): Promise<{ ok: boolean; msgId?: string }> {
  const apiKey = Deno.env.get("SMS_API_KEY");   // 알리고 API key
  const userId = Deno.env.get("SMS_USER_ID");   // 알리고 user_id
  const sender = Deno.env.get("SMS_SENDER");    // 발신 번호
  if (!apiKey || !userId || !sender) return { ok: false };

  // SMS 템플릿별 폴백 메시지 매핑
  const smsTemplates: Record<string, (v: Record<string, string | number>) => string> = {
    ILGAM_M001: (v) =>
      `[일감] 매칭 확정. ${v.work_date} ${v.work_time} ${v.work_address}. 상세는 앱 확인. 취소는 채널톡.`,
    ILGAM_M002: (v) =>
      `[일감] ${v.work_start_time} 근무 시작. ${v.work_address}. 지각 시 현장에 먼저 연락 부탁드립니다.`,
    ILGAM_M003: (v) =>
      `[일감] 급여 ${v.net_amount}원 입금 완료. ${v.bank_name} ${v.account_masked}. 명세서는 앱에서 확인.`,
    ILGAM_M004: (v) =>
      `[일감] ${v.job_title} 신규 지원자 도착. 총 ${v.applicant_count}명. 자동 마감 ${v.auto_close_time}.`,
    ILGAM_M005: (v) =>
      `[일감] ${v.worker_name} 근무 승인 요청. ${v.total_hours}. ${v.approve_deadline} 내 미처리 시 자동 승인.`,
    ILGAM_M006: (v) =>
      `[일감] 문의 ${v.ticket_id} 처리 완료. 상세는 앱 확인. 재문의는 채널톡.`,
  };

  const templateFn = smsTemplates[job.templateId];
  const msg = templateFn ? templateFn(job.variables) : `[일감] 알림 발송에 실패했습니다. 앱을 확인해 주십시오.`;

  const form = new FormData();
  form.append("key", apiKey);
  form.append("user_id", userId);
  form.append("sender", sender);
  form.append("receiver", job.phoneE164.replace(/^\+82/, "0"));
  form.append("msg", msg);
  form.append("msg_type", "SMS");

  try {
    const res = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (data.result_code !== "1") return { ok: false };
    return { ok: true, msgId: data.msg_id };
  } catch (err) {
    console.error("sendSms error", err);
    return { ok: false };
  }
}

async function persistNotification(
  supa: ReturnType<typeof createClient>,
  job: NotifyJob,
  channelUsed: "alimtalk" | "sms",
  fallback: boolean,
  ok: boolean,
  providerMsgId?: string,
  errorCode?: string,
): Promise<void> {
  await supa.from("notifications").insert({
    profile_id: job.userId,
    template_id: job.templateId,
    channel: channelUsed,
    payload: job.variables,
    status: ok ? (fallback ? "fallback" : "sent") : "failed",
    provider_msg_id: providerMsgId ?? null,
    error_code: errorCode ?? null,
    sent_at: ok ? new Date().toISOString() : null,
  });
}

// Bizppurio 재시도 트리거 에러 코드 목록
const ALIMTALK_FALLBACK_CODES = new Set(["R001", "R002", "T001", "E001", "E999"]);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  let job: NotifyJob;
  try {
    job = (await req.json()) as NotifyJob;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  if (!job.templateId || !job.userId || !job.phoneE164) {
    return new Response("missing required fields", { status: 400 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1순위: 알림톡
  const at = await sendAlimtalk(job);
  if (at.ok) {
    await persistNotification(supa, job, "alimtalk", false, true, at.msgId);
    return Response.json({ channelUsed: "alimtalk", fallback: false, ok: true, msgId: at.msgId });
  }

  // 알림톡 실패 + 폴백 가능 코드 → SMS
  if (at.errorCode && ALIMTALK_FALLBACK_CODES.has(at.errorCode)) {
    const sms = await sendSms(job);
    await persistNotification(supa, job, "sms", true, sms.ok, sms.msgId, at.errorCode);
    return Response.json({ channelUsed: "sms", fallback: true, ok: sms.ok, alimtalkErrorCode: at.errorCode });
  }

  // 복구 불가 오류 (설정 오류, 차단 등)
  await persistNotification(supa, job, "alimtalk", false, false, undefined, at.errorCode);
  return Response.json({ ok: false, errorCode: at.errorCode }, { status: 500 });
});
