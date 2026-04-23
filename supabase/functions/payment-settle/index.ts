// supabase/functions/payment-settle/index.ts
// 당일 정산 흐름 (ADR-004): PortOne 웹훅 수신 → payments.status 갱신

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });

  // PortOne 서명 검증
  const signature = req.headers.get("x-portone-signature");
  const secret = Deno.env.get("PORTONE_WEBHOOK_SECRET");
  if (!signature || !secret) {
    return new Response("missing signature", { status: 401 });
  }
  // TODO: HMAC 서명 검증 구현

  const body = await req.json();
  const { imp_uid, status, amount } = body;

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 금액 일치 확인 (불일치 시 P0 알림)
  const { data: payment } = await supa
    .from("payments")
    .select("*")
    .eq("portone_imp_uid", imp_uid)
    .single();

  if (!payment) return new Response("not found", { status: 404 });
  if (payment.gross_amount_krw !== amount) {
    // TODO: 슬랙 P0 알림
    return new Response("amount mismatch", { status: 409 });
  }

  await supa
    .from("payments")
    .update({ status, settled_at: new Date().toISOString() })
    .eq("portone_imp_uid", imp_uid);

  return Response.json({ ok: true });
});
