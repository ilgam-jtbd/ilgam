// 워커 매칭 조회 훅 (ADR-004)
// matches_worker RLS: worker_id 가 본인 workers 행이어야 SELECT 통과.
// Supabase 미설정 시 MOCK_MATCHES 폴백 (UI 검증용).

import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured, isMockAllowed } from "./supabase";
import type { Match, Job } from "@ilgam/core";
import { MOCK_MATCHES, type MatchWithJob } from "./mockMatches";

async function fetchMyMatches(workerId: string | null): Promise<MatchWithJob[]> {
  if (!isSupabaseConfigured || !supabase || !workerId) {
    if (isMockAllowed) return MOCK_MATCHES;
    return [];
  }
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, job_id, worker_id, employer_id, confirmed_at, cancelled_at, cancel_reason, job:jobs(*)"
    )
    .eq("worker_id", workerId)
    .is("cancelled_at", null)
    .order("confirmed_at", { ascending: false });
  if (error) {
    console.warn("[matches.fetchMy]", error.message);
    if (isMockAllowed) return MOCK_MATCHES;
    throw error;
  }
  return (data ?? []) as unknown as MatchWithJob[];
}

export function useMyMatches(workerId: string | null) {
  return useQuery({
    queryKey: ["matches", workerId ?? "anon"],
    queryFn: () => fetchMyMatches(workerId),
    enabled: true,
  });
}

async function fetchMatchById(id: string): Promise<MatchWithJob | null> {
  if (!isSupabaseConfigured || !supabase) {
    if (isMockAllowed) return MOCK_MATCHES.find((m) => m.id === id) ?? null;
    return null;
  }
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, job_id, worker_id, employer_id, confirmed_at, cancelled_at, cancel_reason, job:jobs(*)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn("[matches.fetchById]", error.message);
    if (isMockAllowed) return MOCK_MATCHES.find((m) => m.id === id) ?? null;
    throw error;
  }
  return (data as unknown as MatchWithJob) ?? null;
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: ["match", id ?? ""],
    queryFn: () => fetchMatchById(id!),
    enabled: Boolean(id),
  });
}

export type { Match, Job, MatchWithJob };
