// supabase/functions/qa-classifier/index.ts
// ADR-010 Tier 1 (Postgres rule) + Tier 2 (Claude Haiku) 컨텐츠 QA 분류
//
// 흐름:
// 1. 입력: { job_id }
// 2. jobs 행 조회 (qa_status='pending' 인 것만)
// 3. Tier 1: content_qa_rules (keyword/url) 매치 + 시급 외삽 (consulting 면제)
//    → 매치 시 즉시 rejected/flagged 후 종료 ($0 비용)
// 4. Tier 2: Claude API 호출 → confidence 분기 (>=0.85 자동 / 0.6-0.85 flagged / <0.6 rejected)
// 5. jobs.qa_* 컬럼 갱신
//
// 호출자: 신규 공고 INSERT 직후 webhook (pg-boss) 또는 운영자 수동 재분류

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CLAUDE_MODEL = "claude-3-5-haiku-20241022";

interface JobRow {
  id: string;
  title: string;
  description: string | null;
  hourly_wage_krw: number;
  shift_start_at: string;
  shift_end_at: string;
  category: string | null;
  qa_status: string;
}

interface QAVerdict {
  verdict: "approved" | "rejected" | "flagged";
  confidence: number;
  reason: string;
  category?: string;
}

// ─── Tier 1: Postgres 룰 + 외삽 ──────────────────────────────────────
async function tier1Check(
  supa: ReturnType<typeof createClient>,
  job: JobRow,
): Promise<QAVerdict | null> {
  // 1) 키워드·URL 블랙리스트
  const { data: rules } = await supa
    .from("content_qa_rules")
    .select("id, rule_type, pattern, category")
    .eq("active", true);

  const haystack = `${job.title}\n${job.description ?? ""}`.toLowerCase();
  for (const r of (rules ?? []) as Array<{
    id: string;
    rule_type: string;
    pattern: string;
    category: string | null;
  }>) {
    if (r.rule_type === "keyword_block" && haystack.includes(r.pattern.toLowerCase())) {
      return {
        verdict: "rejected",
        confidence: 0.99,
        reason: `blacklist:${r.id}`,
        category: r.category ?? "blacklist",
      };
    }
    if (r.rule_type === "url_block") {
      const urlRe = new RegExp(r.pattern, "i");
      if (urlRe.test(haystack)) {
        return {
          verdict: "rejected",
          confidence: 0.95,
          reason: `url_block:${r.id}`,
          category: r.category ?? "external_link",
        };
      }
    }
  }

  // 2) 시급 외삽 — consulting 카테고리 면제
  if (job.hourly_wage_krw > 100_000 && job.category !== "consulting") {
    return {
      verdict: "flagged",
      confidence: 0.85,
      reason: `wage_outlier:${job.hourly_wage_krw} (category=${job.category ?? "null"})`,
      category: "wage_outlier",
    };
  }

  // 3) 근무시간 비합리
  const minutes =
    (new Date(job.shift_end_at).getTime() - new Date(job.shift_start_at).getTime()) / 60000;
  if (minutes < 30 || minutes > 720) {
    return {
      verdict: "flagged",
      confidence: 0.8,
      reason: `shift_duration:${Math.round(minutes)}min`,
      category: "duration_outlier",
    };
  }

  return null; // Tier 2로 진행
}

// ─── Tier 2: Claude API ──────────────────────────────────────────────
const SYSTEM_PROMPT = `당신은 한국 시니어 스폿워크 플랫폼 ILGAM의 컨텐츠 QA 분류 에이전트입니다.
50~79세 시니어 워커를 표적으로 한 사기·악성 공고를 차단합니다.

차단(rejected): 성인·유흥 / 도박 / MLM·다단계 / 개인정보 사기 / 고액일당 사기 / 불법
플래그(flagged): 모호 직무, 외부 링크, 시급 외삽 (단 category=consulting 면제)
승인(approved): logistics/food/cleaning/retail/care/agriculture/consulting

consulting 카테고리는 욜드족(65~75세 대기업 출신) 자문이 정상이며 시급 ₩50,000~300,000 정상.

출력은 반드시 JSON 단일 객체:
{"verdict":"approved|rejected|flagged","confidence":0.0~1.0,"reason":"한국어 한 문장","category":"카테고리 코드"}

다른 텍스트 절대 포함 금지.`;

async function tier2Claude(job: JobRow): Promise<QAVerdict> {
  const userMessage = `제목: ${job.title}
설명: ${job.description ?? ""}
시급: ${job.hourly_wage_krw.toLocaleString("ko-KR")}원
시간: ${new Date(job.shift_start_at).toLocaleString("ko-KR")} ~ ${new Date(
    job.shift_end_at,
  ).toLocaleString("ko-KR")}
카테고리: ${job.category ?? "null"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const text = json.content?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`No JSON in Claude response: ${text}`);
  }
  return JSON.parse(match[0]) as QAVerdict;
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });

  let body: { job_id?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (!body.job_id) return new Response("missing job_id", { status: 400 });

  const supa = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: job, error } = await supa
    .from("jobs")
    .select(
      "id, title, description, hourly_wage_krw, shift_start_at, shift_end_at, category, qa_status",
    )
    .eq("id", body.job_id)
    .single();
  if (error || !job) return new Response("job not found", { status: 404 });
  if (job.qa_status !== "pending") {
    return Response.json({ ok: true, skipped: true, reason: `already ${job.qa_status}` });
  }

  // Tier 1
  let verdict = await tier1Check(supa, job as JobRow);
  let classifier: "auto" | "claude" = "auto";

  // Tier 2
  if (!verdict) {
    if (!ANTHROPIC_API_KEY) {
      // Claude 키 미설정 시 보수적으로 flagged → 운영자 큐
      verdict = {
        verdict: "flagged",
        confidence: 0.5,
        reason: "claude_key_missing",
        category: "no_classifier",
      };
    } else {
      try {
        verdict = await tier2Claude(job as JobRow);
        classifier = "claude";
      } catch (e) {
        console.warn("[qa-classifier] Claude error:", (e as Error).message);
        verdict = {
          verdict: "flagged",
          confidence: 0.5,
          reason: `claude_error:${(e as Error).message.slice(0, 80)}`,
          category: "classifier_error",
        };
      }
    }
  }

  // confidence 분기 (Tier 2 결과만 적용)
  if (classifier === "claude") {
    if (verdict.confidence < 0.6) {
      verdict.verdict = "rejected";
      verdict.reason = `low_confidence_${verdict.verdict}: ${verdict.reason}`;
    } else if (verdict.confidence < 0.85) {
      verdict.verdict = "flagged"; // 운영자 큐
    }
  }

  // jobs 갱신
  const { error: updErr } = await supa
    .from("jobs")
    .update({
      qa_status: verdict.verdict,
      qa_reason: verdict.reason,
      qa_classifier: classifier,
      qa_confidence: verdict.confidence,
      qa_reviewed_at: new Date().toISOString(),
    })
    .eq("id", job.id);
  if (updErr) {
    console.error("[qa-classifier] DB update error:", updErr);
    return new Response("db error", { status: 500 });
  }

  return Response.json({ ok: true, ...verdict, classifier });
});
