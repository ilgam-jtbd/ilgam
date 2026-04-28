// supabase/functions/payment-settle/index.ts
// ADR-004 v2 / ADR-011 (M18+): 광고 결제 webhook 수신 placeholder
//
// 변경 (ADR-002 v2 피벗):
// - 매칭 정산 흐름은 폐기 (직거래 모델). 워커 ↔ 구인자 직접 송금, 플랫폼 미개입.
// - 이 함수는 M18 광고 모델 활성화 시 PortOne 광고 결제 webhook을 수신하기 위한 placeholder.
// - dormant 동안에도 서명 검증 + 멱등성은 보존하여 활성화 시 즉시 사용 가능.
//
// 활성화 조건 (ADR-011):
// - ad_slots.active = true (super_admin 토글)
// - PORTONE_WEBHOOK_SECRET 설정
// - ANTHROPIC 결제 시 ad_payments 테이블에 행이 미리 INSERT (status='pending')

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── HMAC 서명 검증 (PortOne V2) ─────────────────────────────────────
async function verifyPortoneSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSec = 300,
): Promise<{ ok: boolean; reason?: string }> {
  if (!signatureHeader) return { ok: false, reason: "missing header" };

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim()];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return { ok: false, reason: "malformed header" };

  const tsNum = Number.parseInt(t, 10);
  if (Number.isNaN(tsNum)) return { ok: false, reason: "invalid ts" };
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > toleranceSec) {
    return { ok: false, reason: "ts expired" };
  }

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex.length !== v1.length) return { ok: false, reason: "length mismatch" };
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0 ? { ok: true } : { ok: false, reason: "sig mismatch" };
}

// ─── PortOne V2 웹훅 페이로드 ────────────────────────────────────────
interface PortoneWebhookV2 {
  type: string;
  timestamp: string;
  data: {
    paymentId: string;
    transactionId: string;
    status: "PAID" | "FAILED" | "CANCELLED" | "PARTIAL_CANCELLED";
    amount?: { total: number };
    cancellation?: { totalAmount: number };
  };
}

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

// ─── 메인 핸들러 ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });

  const secret = Deno.env.get("PORTONE_WEBHOOK_SECRET");
  if (!secret) {
    // M18 활성화 전 호출 — 명시적 503으로 응답
    return new Response("dormant: ad payment webhook not yet activated", { status: 503 });
  }

  const rawBody = await req.text();
  const sigHeader = req.headers.get("x-portone-signature");
  const verify = await verifyPortoneSignature(rawBody, sigHeader, secret);
  if (!verify.ok) {
    return new Response(`unauthorized: ${verify.reason}`, { status: 401 });
  }

  let event: PortoneWebhookV2;
  try {
    event = JSON.parse(rawBody) as PortoneWebhookV2;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const paymentId = event.data.paymentId;
  const status = mapStatus(event.data.status);

  // ad_payments 행 조회
  const { data: payment, error: fetchErr } = await supa
    .from("ad_payments")
    .select("id, amount_krw, status, portone_imp_uid")
    .eq("portone_imp_uid", paymentId)
    .single();

  if (fetchErr || !payment) {
    return new Response("not found", { status: 404 });
  }

  // 금액 일치 확인 (PAID에만 의미)
  const remoteAmount =
    event.data.status === "PAID" ? event.data.amount?.total : event.data.cancellation?.totalAmount;

  if (
    event.data.status === "PAID" &&
    typeof remoteAmount === "number" &&
    remoteAmount !== payment.amount_krw
  ) {
    await supa.from("ad_payments").update({ status: "failed" }).eq("id", payment.id);
    return new Response("amount mismatch", { status: 409 });
  }

  // 멱등성
  if (payment.status === status) {
    return Response.json({ ok: true, idempotent: true });
  }

  if (payment.status === "refunded" && status === "paid") {
    return new Response("invalid transition", { status: 409 });
  }

  const { error: updateErr } = await supa
    .from("ad_payments")
    .update({ status })
    .eq("id", payment.id);

  if (updateErr) {
    return new Response("db error", { status: 500 });
  }

  return Response.json({ ok: true, status });
});

export { verifyPortoneSignature, mapStatus };
