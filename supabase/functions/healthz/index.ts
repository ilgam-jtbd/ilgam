// supabase/functions/healthz/index.ts
// 프로덕션 하네스 H5 — Health check (Uptime Kuma 60s 폴링용)
//
// 검사 4종:
//   1. DB ping (Supabase) — SELECT 1
//   2. Claude API ping — 1 token completion (선택, ANTHROPIC_API_KEY 있을 때)
//   3. PortOne 도달성 (HEAD 요청, M6 활성화 후만 검사)
//   4. self meta (deploy SHA, region)
//
// 응답:
//   200 OK = { ok: true, checks: {...}, latency_ms, sha }
//   503 = { ok: false, failed: [...], degraded: [...] }
//
// 인증 불필요 (verify_jwt = false 라고 supabase/config.toml 에서 마킹 필요)
// Uptime Kuma는 200/503만 보고 PagerDuty 트리거.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const PORTONE_HEALTH_URL = Deno.env.get("PORTONE_HEALTH_URL") ?? "";
const DEPLOY_SHA = Deno.env.get("DEPLOY_SHA") ?? "unknown";
const DEPLOY_REGION = Deno.env.get("DEPLOY_REGION") ?? "ap-northeast-2";

interface CheckResult {
  ok: boolean;
  latency_ms: number;
  detail?: string;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const t0 = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - t0) };
}

async function checkDB(): Promise<CheckResult> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return { ok: false, latency_ms: 0, detail: "no_creds" };
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { ms } = await timed(async () => {
      const { error } = await supa.rpc("ping").select();
      // ping RPC 없으면 trivial select
      if (error && !error.message.includes("does not exist")) throw error;
      const { error: e2 } = await supa.from("regions").select("dong_code").limit(1);
      if (e2) throw e2;
    });
    return { ok: true, latency_ms: ms };
  } catch (e) {
    return { ok: false, latency_ms: 0, detail: (e as Error).message.slice(0, 120) };
  }
}

async function checkClaude(): Promise<CheckResult> {
  if (!ANTHROPIC_API_KEY) return { ok: true, latency_ms: 0, detail: "skipped (no key)" };
  try {
    const { ms } = await timed(async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "ok" }],
        }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) throw new Error(`claude ${res.status}`);
    });
    return { ok: true, latency_ms: ms };
  } catch (e) {
    return { ok: false, latency_ms: 0, detail: (e as Error).message.slice(0, 120) };
  }
}

async function checkPortOne(): Promise<CheckResult> {
  // M6 활성화 전이면 skip
  if (!PORTONE_HEALTH_URL) return { ok: true, latency_ms: 0, detail: "skipped (M6 dormant)" };
  try {
    const { ms } = await timed(async () => {
      const res = await fetch(PORTONE_HEALTH_URL, {
        method: "HEAD",
        signal: AbortSignal.timeout(3_000),
      });
      if (!res.ok) throw new Error(`portone ${res.status}`);
    });
    return { ok: true, latency_ms: ms };
  } catch (e) {
    return { ok: false, latency_ms: 0, detail: (e as Error).message.slice(0, 120) };
  }
}

serve(async (req) => {
  const t0 = performance.now();
  const url = new URL(req.url);
  const verbose = url.searchParams.get("verbose") === "1";

  const [db, claude, portone] = await Promise.all([checkDB(), checkClaude(), checkPortOne()]);

  // DB 는 critical, 다른 둘은 degraded 허용
  const failed: string[] = [];
  const degraded: string[] = [];
  if (!db.ok) failed.push("db");
  if (!claude.ok && claude.detail !== "skipped (no key)") degraded.push("claude");
  if (!portone.ok && portone.detail !== "skipped (M6 dormant)") degraded.push("portone");

  const ok = failed.length === 0;
  const totalMs = Math.round(performance.now() - t0);

  const body = {
    ok,
    sha: DEPLOY_SHA,
    region: DEPLOY_REGION,
    latency_ms: totalMs,
    checks: verbose ? { db, claude, portone } : undefined,
    failed: failed.length ? failed : undefined,
    degraded: degraded.length ? degraded : undefined,
  };

  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 503,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
});
