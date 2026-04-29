// supabase/functions/cx-triage/index.ts
// CX 인입 트리아지 (ADR-008): Claude intent 분류 + 라우팅

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AUTO_THRESHOLD = 0.85;
const CONFIRM_LOW = 0.6;
const ESCALATE_INTENTS = new Set(["신고", "급여미지급", "사기"]);

const SYSTEM_PROMPT = `당신은 시니어 스팟워크 플랫폼 "일감"의 고객지원 분류 AI입니다.
사용자 메시지를 분석해 intent와 confidence를 JSON으로만 응답하세요.

가능한 intent 목록:
- 급여문의: 급여, 정산, 입금, 돈 관련
- 공고문의: 일감 찾기, 공고 조회, 신청 관련
- 출퇴근문의: 출근 확인, 퇴근 처리, QR코드 관련
- 앱오류: 앱 안됨, 로그인 불가, 오류 메시지 관련
- 온보딩: 가입, 계정 생성, 첫 사용 관련
- 급여미지급: 돈을 못 받았다, 미지급, 떼먹었다
- 신고: 신고, 위험, 폭언, 부당대우
- 사기: 사기, 속았다, 허위공고
- 기타: 위 분류에 해당하지 않는 모든 경우

응답 형식 (JSON 외 텍스트 절대 금지):
{"intent": "intent명", "confidence": 0.0~1.0}`;

interface IncomingTicket {
  profile_id: string;
  channel: "channeltalk" | "sms" | "kakao" | "inapp";
  message: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
}

async function classifyIntent(
  message: string,
): Promise<{ intent: string; confidence: number }> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return { intent: "기타", confidence: 0 };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 64,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      console.error("Claude API error", res.status, await res.text());
      return { intent: "기타", confidence: 0 };
    }

    const data = (await res.json()) as ClaudeResponse;
    const text = data.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return {
      intent: String(parsed.intent ?? "기타"),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0))),
    };
  } catch (err) {
    console.error("classifyIntent error", err);
    return { intent: "기타", confidence: 0 };
  }
}

async function persistTicket(
  supa: ReturnType<typeof createClient>,
  ticket: IncomingTicket,
  intent: string,
  confidence: number,
  action: string,
): Promise<void> {
  await supa.from("cx_tickets").insert({
    profile_id: ticket.profile_id,
    channel: ticket.channel,
    intent,
    intent_confidence: confidence,
    ai_answered: action === "auto_answer",
    escalated_at: action === "escalate_human" ? new Date().toISOString() : null,
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  let ticket: IncomingTicket;
  try {
    ticket = (await req.json()) as IncomingTicket;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  if (!ticket.profile_id || !ticket.message) {
    return new Response("missing profile_id or message", { status: 400 });
  }

  const { intent, confidence } = await classifyIntent(ticket.message);

  let action: "auto_answer" | "confirm_card" | "escalate_human";
  if (ESCALATE_INTENTS.has(intent) || confidence < CONFIRM_LOW) {
    action = "escalate_human";
  } else if (confidence >= AUTO_THRESHOLD) {
    action = "auto_answer";
  } else {
    action = "confirm_card";
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  await persistTicket(supa, ticket, intent, confidence, action);

  return Response.json({ action, intent, confidence });
});
