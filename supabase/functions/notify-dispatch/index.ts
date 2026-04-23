// supabase/functions/notify-dispatch/index.ts
// 알림톡 1순위 → 실패 시 SMS 폴백 (ADR-004, ADR-008)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface NotifyJob {
  templateId: string;
  userId: string;
  phoneE164: string;
  variables: Record<string, string | number>;
}

async function sendAlimtalk(job: NotifyJob): Promise<{ ok: boolean; errorCode?: string }> {
  const apiKey = Deno.env.get("KAKAO_ALIMTALK_API_KEY");
  if (!apiKey) return { ok: false, errorCode: "CONFIG" };
  // TODO: Bizppurio 실제 호출
  return { ok: true };
}

async function sendSms(job: NotifyJob): Promise<{ ok: boolean }> {
  const smsKey = Deno.env.get("SMS_API_KEY");
  if (!smsKey) return { ok: false };
  // TODO: 알리고/LG U+ 실제 호출
  return { ok: true };
}

serve(async (req) => {
  const job = (await req.json()) as NotifyJob;
  const at = await sendAlimtalk(job);
  if (at.ok) return Response.json({ channelUsed: "alimtalk", fallback: false });

  const fallbackCodes = ["R001", "R002", "T001"];
  if (at.errorCode && fallbackCodes.includes(at.errorCode)) {
    const sms = await sendSms(job);
    return Response.json({
      channelUsed: "sms",
      fallback: true,
      ok: sms.ok,
    });
  }
  return Response.json({ ok: false, errorCode: at.errorCode }, { status: 500 });
});
