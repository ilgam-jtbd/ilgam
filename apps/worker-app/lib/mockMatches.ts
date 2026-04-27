// 개발용 샘플 매칭 — Supabase 미설정 또는 인증 미완 시 사용.
// 실 데이터: matches WHERE worker_id = me (RLS 자동 필터).

import type { Match, Job } from "@ilgam/core";
import { MOCK_JOBS } from "./mockJobs";

export type MatchWithJob = Match & { job: Job };

const ANON_WORKER_ID = "00000000-0000-0000-0000-000000000000";

export const MOCK_MATCHES: MatchWithJob[] = [
  {
    id: "match-001",
    job_id: "job-001",
    worker_id: ANON_WORKER_ID,
    employer_id: "emp-001",
    confirmed_at: "2026-04-26T10:30:00+09:00",
    cancelled_at: null,
    cancel_reason: null,
    job: MOCK_JOBS.find((j) => j.id === "job-001") ?? MOCK_JOBS[0],
  },
  {
    id: "match-002",
    job_id: "job-002",
    worker_id: ANON_WORKER_ID,
    employer_id: "emp-002",
    confirmed_at: "2026-04-25T14:15:00+09:00",
    cancelled_at: null,
    cancel_reason: null,
    job: MOCK_JOBS.find((j) => j.id === "job-002") ?? MOCK_JOBS[1],
  },
];
