// supabase/functions/cx-triage/index.ts
// CX 인입 트리아지 (ADR-008): Claude intent 분류 + 라우팅

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AUTO_THRESHOLD = 0.85;
const CONFIRM_LOW = 0.6;
const ESCALATE_INTENTS = new Set(["신고", "급여미지급", "사기"]);

// 자동 답변 템플릿 (intent → 한국어 FAQ 답변)
const AUTO_ANSWERS: Record<string, string> = {
  급여문의:
    "안녕하세요! 일감입니다 😊\n\n급여는 근무 완료 후 3영업일 이내에 등록하신 계좌로 입금됩니다.\n앱 > 내 근무 탭에서 정산 내역과 입금 예정일을 확인하실 수 있습니다.\n\n추가 문의는 채널톡으로 남겨주세요.",
  공고문의:
    "안녕하세요! 일감입니다 😊\n\n맞춤 일감은 앱 > 오늘 일감 탭에서 확인하실 수 있습니다.\n선호 동네·요일·업종을 설정하시면 더 많은 공고가 표시됩니다.\n\n공고 신청 후 확정 시 알림톡으로 안내드립니다.",
  출퇴근문의:
    "안녕하세요! 일감입니다 😊\n\n출근 체크는 현장 500m 이내에서 앱 > 내 근무 탭의 '출근 체크하기' 버튼을 눌러 진행합니다.\nGPS 정확도를 위해 실외에서 체크해 주세요.\n\n이미 현장에 계신데 안 된다면 채널톡으로 알려주세요!",
  앱오류:
    "안녕하세요! 일감입니다 😊\n\n앱을 완전히 종료 후 다시 실행해 주세요.\n그래도 오류가 계속되면 채널톡으로 ① 기기 종류 ② 오류 화면 캡처를 보내주시면 빠르게 도와드리겠습니다.",
  온보딩:
    "안녕하세요, 일감에 오신 것을 환영합니다! 🎉\n\n앱 다운로드 → 전화번호 인증 → 기본 정보 입력 순으로 가입하실 수 있습니다.\n가입 후 온보딩에서 선호 동네와 업종을 설정하시면 바로 일감을 확인하실 수 있어요.",
};

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
  aiAnswer: string | null,
): Promise<void> {
  await supa.from("cx_tickets").insert({
    profile_id: ticket.profile_id,
    channel: ticket.channel,
    intent,
    intent_confidence: confidence,
    ai_answered: action === "auto_answer",
    ai_answer: aiAnswer,
    escalated_at: action === "escalate_human" ? new Date().toISOString() : null,
  });
}

Deno.serve(async (req) => {
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

  const aiAnswer = action === "auto_answer" ? (AUTO_ANSWERS[intent] ?? null) : null;

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  await persistTicket(supa, ticket, intent, confidence, action, aiAnswer);

  return Response.json({ action, intent, confidence, ...(aiAnswer ? { answer: aiAnswer } : {}) });
});
