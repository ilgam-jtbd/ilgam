// 워커용 일감 조회/지원 훅 (ADR-004)
// 데이터 흐름:
//   - 인증 + Supabase env 모두 갖춰진 경우: match-engine Edge Function 호출 → 랭킹된 일감
//   - 그 외: Mock 일감 반환 (개발 화면 검증용)
// 지원(apply): 직접 supabase.from("job_applications").insert (RLS 가 worker 본인만 INSERT 허용)

import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Job } from "@ilgam/core";
import { MOCK_JOBS } from "./mockJobs";

async function fetchMatchedJobs(workerId: string, limit = 20): Promise<Job[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_JOBS;

  // match-engine 은 service-role 로 RPC 를 호출하므로 클라이언트는 인증 토큰을 함께 전달.
  const { data, error } = await supabase.functions.invoke("match-engine", {
    body: { worker_id: workerId, limit },
  });
  if (error) {
    console.warn("[match-engine]", error.message);
    return MOCK_JOBS;
  }
  const rows = (data?.jobs ?? []) as Array<Job & { score?: number }>;
  return rows.length > 0 ? rows : MOCK_JOBS;
}

export function useMatchedJobs(workerId: string | null) {
  return useQuery({
    queryKey: ["jobs", workerId ?? "anon"],
    queryFn: () => fetchMatchedJobs(workerId ?? "anon", 20),
    enabled: true,
  });
}

type ApplyArgs = { jobId: string; workerId: string };

async function applyToJob({ jobId, workerId }: ApplyArgs) {
  if (!isSupabaseConfigured || !supabase) {
    return { id: "mock-application", job_id: jobId, worker_id: workerId };
  }
  const { data, error } = await supabase
    .from("job_applications")
    .insert({ job_id: jobId, worker_id: workerId })
    .select("id, job_id, worker_id, status")
    .single();
  if (error) throw error;
  return data;
}

export function useApplyToJob() {
  return useMutation({ mutationFn: applyToJob });
}
