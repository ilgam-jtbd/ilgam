// Demo Mode 토글 — Vercel preview 배포 / 투자자·파트너 데모 / 자격증명 미수령 상태에서 화면 검증
// 활성화 조건: `NEXT_PUBLIC_DEMO_MODE=1` (Vercel 환경 변수)
// 활성화 시: Supabase RSC 호출을 mock fixture로 단락 → 인증·RLS 우회.
//
// 안전 가드 (iter10 High):
// prod 환경(VERCEL_ENV === "production" 또는 NODE_ENV === "production" + 호스트가 main 도메인)
// 에서 DEMO_MODE=1이 함께 켜져 있으면 빌드 시 throw. 실 데이터 우회 인상 방지.

import type { Employer } from "@ilgam/core";

const _rawDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
const _isProd = process.env.VERCEL_ENV === "production"
  || (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview");
if (_rawDemo && _isProd) {
  throw new Error(
    "[demo.ts] NEXT_PUBLIC_DEMO_MODE=1 가 prod 환경에서 활성화됨. " +
      "Vercel preview/development 한정으로만 사용. 즉시 환경 변수 제거.",
  );
}
export const isDemoMode = _rawDemo && !_isProd;

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
