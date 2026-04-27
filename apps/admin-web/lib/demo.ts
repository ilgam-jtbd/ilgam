// Demo Mode 토글 — Vercel preview 배포 / 투자자·파트너 데모 / 자격증명 미수령 상태에서 화면 검증
// 활성화 조건: `NEXT_PUBLIC_DEMO_MODE=1` (Vercel 환경 변수)
// 활성화 시: Supabase RSC 호출을 mock fixture로 단락 → 인증·RLS 우회.
// 주의: prod 환경에서 절대 활성화 금지. Vercel branch deploy / preview 한정.

import type { Employer } from "@ilgam/core";

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

// ─── 데모용 픽스처 ────────────────────────────────────────────────
export const DEMO_PENDING_EMPLOYERS: Employer[] = [
  {
    id: "demo-emp-001",
    biz_name: "(주)한빛물류",
    contact_name: "이철수",
    contact_phone_e164: "+821012345678",
    biz_type: "물류·유통",
    approved_at: null,
    suspended_at: null,
  },
  {
    id: "demo-emp-002",
    biz_name: "본죽 성북점",
    contact_name: "박영희",
    contact_phone_e164: "+821087654321",
    biz_type: "F&B",
    approved_at: null,
    suspended_at: null,
  },
  {
    id: "demo-emp-003",
    biz_name: "강남 오피스 청소 전문",
    contact_name: "김순희",
    contact_phone_e164: "+821055556666",
    biz_type: "청소·환경",
    approved_at: null,
    suspended_at: null,
  },
];

export const DEMO_DASHBOARD_STATS = {
  openJobs: 12,
  matchedJobs: 8,
  inProgressJobs: 3,
  completedShiftsThisMonth: 47,
  totalPayoutThisMonthKrw: 2_245_600,
};

export const DEMO_EMPLOYER_OPTIONS = [
  { id: "demo-emp-001", biz_name: "(주)한빛물류" },
  { id: "demo-emp-002", biz_name: "본죽 성북점" },
];

export type DemoEmployerOption = (typeof DEMO_EMPLOYER_OPTIONS)[number];
