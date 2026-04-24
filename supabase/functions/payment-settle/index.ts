// supabase/functions/payment-settle/index.ts
// 당일 정산 흐름 (ADR-004): PortOne 웹훅 수신 → payments.status 갱신
//
// 자체 서명 검증 (verify_jwt=false) — HMAC-SHA256(body, PORTONE_WEBHOOK_SECRET)
// 에스크로 모델 (통신판매중개업): 플랫폼은 결제금을 보유하지 않고 고용주 → 근로자 중개만
// 불일치 금액은 P0 슬랙 + DB 상태 discrepancy 기록, 자동 반영 차단.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── HMAC 서명 검증 ───────────────────────────────────────────────────
// PortOne V2 웹훅: X-Portone-Signature: t=<unix_ts>,v1=<hex>
// 서명 대상: `${t}.${raw_body}` (문서 기준)
async function verifyPortoneSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSec = 300
): Promise<{ ok: boolean; reason?: string }> {
  if (!signatureHeader) return { ok: false, reason: "missing header" };

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim()];
    })
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return { ok: false, reason: "malformed header" };

  // 타임스탬프 허용 윈도 (재전송 공격 방지)
  const tsNum = Number.parseInt(t, 10);
  if (Number.isNaN(tsNum)) return { ok: false, reason: "invalid ts" };
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > toleranceSec) {
    return { ok: false, reason: "ts expired" };
  }

  // HMAC-SHA256
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 상수시간 비교
  if (hex.length !== v1.length) return { ok: false, reason: "length mismatch" };
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0 ? { ok: true } : { ok: false, reason: "sig mismatch" };
}

// ─── Slack P0 알림 ─────────────────────────────────────────────────────
async function slackAlert(message: string, details: Record<string, unknown>) {
  const webhook = Deno.env.get("SLACK_WEBHOOK_URL_P0");
  if (!webhook) {
    console.error("[P0] Slack webhook not configured:", message, details);
    return;
  }
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `:rotating_light: ${message}`,
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: `*${message}*` } },
          {
            type: "section",
            text: { type: "mrkdwn", text: `\`\`\`${JSON.stringify(details, null, 2)}\`\`\`` },
          },
        ],
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (e) {
    console.error("Slack alert failed:", e);
  }
}

// ─── PortOne 웹훅 페이로드 ─────────────────────────────────────────────
interface PortoneWebhookV2 {
  type: string;                // "Transaction.Paid" | "Transaction.Failed" | "Transaction.Cancelled"
  timestamp: string;
  data: {
    paymentId: string;         // imp_uid 상당
    transactionId: string;
    status: "PAID" | "FAILED" | "CANCELLED" | "PARTIAL_CANCELLED";
    amount?: { total: number };
    cancellation?: { totalAmount: number };
  };
}

// PortOne webhook status → payments.status
function mapStatus(s: PortoneWebhookV2["data"]["status"]): "paid" | "failed" | "refunded" {
  switch (s) {
    case "PAID":
      return "paid";
    case "CANCELLED":
    case "PARTIAL_CANCELLED":
      return "refunded";
    case "FAILED":
      return "failed";
  }
}

// ─── 메인 핸들러 ──────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });

  const secret = Deno.env.get("PORTONE_WEBHOOK_SECRET");
  if (!secret) {
    console.error("PORTONE_WEBHOOK_SECRET not configured");
    return new Response("config", { status: 500 });
  }

  // 서명 검증 대상은 raw body 이므로 text로 먼저 읽기
  const rawBody = await req.text();
  const sigHeader = req.headers.get("x-portone-signature");

  const verify = await verifyPortoneSignature(rawBody, sigHeader, secret);
  if (!verify.ok) {
    console.warn("PortOne signature verification failed:", verify.reason);
    return new Response("unauthorized", { status: 401 });
  }

  let event: PortoneWebhookV2;
  try {
    event = JSON.parse(rawBody) as PortoneWebhookV2;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const paymentId = event.data.paymentId;
  const status = mapStatus(event.data.status);

  // payments 행 조회 (portone_payment_id 기준)
  const { data: payment, error: fetchErr } = await supa
    .from("payments")
    .select("id, gross_amount_krw, status, portone_payment_id")
    .eq("portone_payment_id", paymentId)
    .single();

  if (fetchErr || !payment) {
    await slackAlert("PortOne 웹훅 미매칭 paymentId", {
      paymentId,
      eventType: event.type,
      dbError: fetchErr?.message,
    });
    return new Response("not found", { status: 404 });
  }

  // 금액 일치 확인 (PAID 에만 의미 있음)
  const remoteAmount =
    event.data.status === "PAID"
      ? event.data.amount?.total
      : event.data.cancellation?.totalAmount;

  if (
    event.data.status === "PAID" &&
    typeof remoteAmount === "number" &&
    remoteAmount !== payment.gross_amount_krw
  ) {
    await slackAlert("결제 금액 불일치 — 자동 반영 차단", {
      paymentId,
      dbAmount: payment.gross_amount_krw,
      remoteAmount,
      paymentRowId: payment.id,
    });
    // 상태 반영 차단: 수동 조사 대상
    await supa
      .from("payments")
      .update({ status: "failed", settlement_error: "amount_mismatch" })
      .eq("id", payment.id);
    return new Response("amount mismatch", { status: 409 });
  }

  // 멱등성: 이미 같은 최종 상태면 200 반환 (PortOne 재시도 대비)
  if (payment.status === status) {
    return Response.json({ ok: true, idempotent: true });
  }

  // 상태 전이 (paid → refunded 는 허용, refunded → paid 는 거부)
  if (payment.status === "refunded" && status === "paid") {
    await slackAlert("이상 상태 전이 시도 (refunded → paid)", {
      paymentId,
      currentStatus: payment.status,
      incomingStatus: status,
    });
    return new Response("invalid transition", { status: 409 });
  }

  const { error: updateErr } = await supa
    .from("payments")
    .update({
      status,
      settled_at: status === "paid" ? new Date().toISOString() : null,
      refunded_at: status === "refunded" ? new Date().toISOString() : null,
    })
    .eq("id", payment.id);

  if (updateErr) {
    await slackAlert("payments 상태 갱신 실패", {
      paymentId,
      dbError: updateErr.message,
    });
    return new Response("db error", { status: 500 });
  }

  return Response.json({ ok: true, status });
});

// ─── 테스트용 export ──────────────────────────────────────────────────
export { verifyPortoneSignature, mapStatus };
