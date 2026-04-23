// supabase/functions/match-engine/index.ts
// 매칭 랭킹 (ADR-004): RPC 1차 필터 + Deno에서 2차 재랭킹 정리
// LLM 미사용 (시니어 UX 레이턴시 요건)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MatchRequest {
  worker_id: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const { worker_id, limit = 20 } = (await req.json()) as MatchRequest;

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1차: RPC 필터링
  const { data, error } = await supa.rpc("match_jobs_for_worker", {
    p_worker_id: worker_id,
    p_limit: limit,
  });
  if (error) return new Response(error.message, { status: 500 });

  // 2차: 거리·시급·노쇼율 가중합 (LLM 없음)
  const ranked = (data ?? []).map((row: any) => ({
    ...row,
    score:
      (row.wage_score ?? 0) * 0.5 +
      (row.distance_score ?? 0) * 0.3 +
      (row.mentor_tag_score ?? 0) * 0.2,
  })).sort((a: any, b: any) => b.score - a.score);

  return Response.json({ jobs: ranked });
});
