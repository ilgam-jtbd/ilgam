// supabase/functions/payment-settle/index.ts
// PortOne 웹훅 수신 → payments.status 갱신 (ADR-004)
// 필드: portone_imp_uid (0004 마이그에서 payments 테이블에 추가)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

// PortOne 웹훅 페이로드 (v1 기준)
interface PortOneWebhook {
  imp_uid: string;
  merchant_uid: string;
  status: PaymentStatus;
  amount: number;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyHmacSha256(
  secret: string,
  body: string,
  signature: string,
): Promise<boolean> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const computed = toHex(mac);
  if (computed.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

async function notifyP0Slack(message: string): Promise<void> {
  const url = Deno.env.get("SLACK_P0_WEBHOOK_URL");
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `[P0] payment-settle: ${message}` }),
  }).catch((err) => console.error("slack notify failed", err));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const signature = req.headers.get("x-portone-signature") ?? "";
  const secret = Deno.env.get("PORTONE_WEBHOOK_SECRET");
  if (!secret) {
    return new Response("webhook secret not configured", { status: 500 });
  }

  const rawBody = await req.text();

  const valid = await verifyHmacSha256(secret, rawBody, signature);
  if (!valid) {
    console.error("HMAC signature mismatch");
    return new Response("invalid signature", { status: 401 });
  }

  let body: PortOneWebhook;
  try {
    body = JSON.parse(rawBody) as PortOneWebhook;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const { imp_uid, status, amount } = body;
  if (!imp_uid || !status) {
    return new Response("missing imp_uid or status", { status: 400 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 결제 레코드 조회 (portone_imp_uid 기준)
  const { data: payment, error: fetchErr } = await supa
    .from("payments")
    .select("id, gross_amount_krw, status")
    .eq("portone_imp_uid", imp_uid)
    .single();

  if (fetchErr || !payment) {
    console.error("payment not found", imp_uid);
    return new Response("payment not found", { status: 404 });
  }

  // 금액 불일치 → P0 알림 + 409
  if (payment.gross_amount_krw !== amount) {
    const msg = `금액 불일치 imp_uid=${imp_uid} DB=${payment.gross_amount_krw} PortOne=${amount}`;
    console.error(msg);
    await notifyP0Slack(msg);
    return new Response("amount mismatch", { status: 409 });
  }

  // 이미 최종 상태면 멱등성 보장
  if (["paid", "refunded", "failed"].includes(payment.status) && payment.status === status) {
    return Response.json({ ok: true, idempotent: true });
  }

  const { error: updateErr } = await supa
    .from("payments")
    .update({
      status,
      settled_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("portone_imp_uid", imp_uid);

  if (updateErr) {
    console.error("update failed", updateErr.message);
    return new Response("db update failed", { status: 500 });
  }

  return Response.json({ ok: true });
});
