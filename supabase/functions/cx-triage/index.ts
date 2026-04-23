// supabase/functions/cx-triage/index.ts
// CX 인입 트리아지 (ADR-008): Claude intent 분류 + 라우팅

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const AUTO_THRESHOLD = 0.85;
const CONFIRM_LOW = 0.6;
const AUTO_BLOCKED_INTENTS = new Set(["신고", "급여미지급"]);

interface IncomingTicket {
  profile_id: string;
  channel: "channeltalk" | "sms" | "kakao" | "inapp";
  message: string;
}

async function classifyIntent(message: string): Promise<{ intent: string; confidence: number }> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return { intent: "기타", confidence: 0 };
  // TODO: Claude API 호출 (sonnet-4-6)
  return { intent: "급여문의", confidence: 0.92 };
}

serve(async (req) => {
  const ticket = (await req.json()) as IncomingTicket;
  const { intent, confidence } = await classifyIntent(ticket.message);
  if (AUTO_BLOCKED_INTENTS.has(intent) || confidence < CONFIRM_LOW) {
    return Response.json({ action: "escalate_human", intent, confidence });
  }
  if (confidence >= AUTO_THRESHOLD) {
    return Response.json({ action: "auto_answer", intent, confidence });
  }
  return Response.json({ action: "confirm_card", intent, confidence });
});
