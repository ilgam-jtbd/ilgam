// 일감 공유 타입 · Supabase 스키마와 1:1

export type Role = "worker" | "employer" | "admin";

export interface Profile {
  id: string;
  display_name: string | null;
  phone_e164: string | null;
  role: Role;
  kakao_user_id: string | null;
  created_at: string;
}

export interface Worker {
  id: string;
  profile_id: string;
  ci_token: string | null;
  birth_ymd: string | null;
  gender_code: "M" | "F" | null;
  home_dong_code: string | null;
  cert_codes: string[];
  mentor_tags: string[];
  no_show_count: number;
  rating_avg: number | null;
}

export interface Employer {
  id: string;
  biz_name: string;
  contact_name: string;
  contact_phone_e164: string;
  biz_type: string | null;
  approved_at: string | null;
  suspended_at: string | null;
}

export type JobStatus = "open" | "matched" | "in_progress" | "completed" | "cancelled";

export type JobCategory =
  | "logistics" // 물류·배송
  | "food" // 외식·카페
  | "cleaning" // 청소·환경
  | "retail" // 유통·판매
  | "care" // 돌봄·의료
  | "agriculture" // 농업·자연
  | "consulting"; // 자문·멘토링 (욜드족 대기업 출신, ADR-002 v2.1)

export const JOB_CATEGORY_LABEL: Record<JobCategory, string> = {
  logistics: "물류·배송",
  food: "외식·카페",
  cleaning: "청소·환경",
  retail: "유통·판매",
  care: "돌봄·의료",
  agriculture: "농업·자연",
  consulting: "자문·멘토링",
};

// 시니어 가독성 + 스크린리더 일관성을 위해 한글 1자 라벨 채택 (DESIGN.md, iter06).
// 이모지는 OS·폰트별 렌더 차이 + TalkBack/VoiceOver 발음 불일치로 폐기.
export const JOB_CATEGORY_LETTER: Record<JobCategory, string> = {
  logistics: "물", // 물류·배송
  food: "식", // 외식·카페
  cleaning: "청", // 청소·환경
  retail: "유", // 유통·판매
  care: "돌", // 돌봄·의료
  agriculture: "농", // 농업·자연
  consulting: "자", // 자문·멘토링 (욜드족)
};

/** @deprecated Use JOB_CATEGORY_LETTER for ARIA + cross-OS consistency. */
export const JOB_CATEGORY_EMOJI: Record<JobCategory, string> = {
  logistics: "📦",
  food: "🍽️",
  cleaning: "🧹",
  retail: "🛒",
  care: "💊",
  agriculture: "🌾",
  consulting: "💼",
};

export type QaStatus = "pending" | "approved" | "rejected" | "flagged";
export type QaClassifier = "auto" | "claude" | "operator" | "report";

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  dong_code: string;
  dong_label: string | null;
  shift_start_at: string;
  shift_end_at: string;
  hourly_wage_krw: number;
  required_cert_codes: string[];
  preferred_mentor_tags: string[];
  headcount: number;
  status: JobStatus;
  category: JobCategory | null;
  distance_km: number | null;
  instant_pay: boolean;
  note: string | null;
  // ADR-010 컨텐츠 QA (0006 마이그레이션)
  qa_status: QaStatus;
  qa_reason: string | null;
  qa_classifier: QaClassifier | null;
  qa_reviewed_by: string | null;
  qa_reviewed_at: string | null;
  qa_confidence: number | null;
}

// ADR-010 외부 신고
export type ContentReportRole = "worker" | "employer" | "operator" | "external";
export type ContentReportStatus = "open" | "resolved" | "dismissed";

export interface ContentReport {
  id: string;
  job_id: string;
  reporter_profile_id: string | null;
  reporter_role: ContentReportRole;
  category: string;
  description: string | null;
  status: ContentReportStatus;
  shadow_hidden_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  confirmed_at: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

export interface Shift {
  id: string;
  match_id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  worked_minutes: number | null;
  employer_approved_at: string | null;
  dispute_status: "none" | "raised" | "resolved";
}

/**
 * @deprecated ADR-002 v2 피벗으로 정산 흐름 폐기. 워커 ↔ 구인자 직거래.
 * 이 타입은 M2 정리 PR에서 archive 후 제거 예정. 새 코드는 참조 금지.
 * 광고 결제는 AdPayment (packages/core/src/ads.ts) 사용.
 */
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

/** @deprecated ADR-002 v2 — 광고는 AdPayment 사용 */
export interface Payment {
  id: string;
  shift_id: string;
  worker_id: string;
  employer_id: string;
  gross_amount_krw: number;
  platform_fee_rate: number;
  platform_fee_krw: number;
  worker_net_krw: number;
  status: PaymentStatus;
  expected_settle_at: string | null;
  settled_at: string | null;
}

// ─── 운영자 백오피스 (ADR-009) ───────────────────────────

export type AdminRole = "super_admin" | "operator";

export interface PlatformAdmin {
  profile_id: string;
  active: boolean;
  role: AdminRole;
  mfa_enrolled: boolean;
  last_mfa_at: string | null;
  allowed_ip_cidrs: string[];
  created_at: string;
}

export type OperatorActionType =
  | "employer_approve"
  | "employer_reject"
  | "employer_suspend"
  | "report_resolve"
  | "report_shadow_hide"
  | "report_block_employer"
  | "payment_refund_partial"
  | "payment_refund_full"
  | "payment_escrow_hold"
  | "worker_ban"
  | "worker_unban"
  | "audit_search"
  | "internal_page_view"
  | "admin_invite"
  | "admin_revoke"
  | "admin_mfa_reset";

export interface OperatorAction {
  id: number;
  actor_id: string;
  action_type: OperatorActionType;
  target_table: string | null;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  source_ip: string | null;
  created_at: string;
}

export interface NotifyRequest {
  templateId: string;
  channel: "alimtalk" | "sms" | "push";
  userId: string;
  payload: Record<string, string | number>;
}

export interface NotifyResult {
  ok: boolean;
  channelUsed: "alimtalk" | "sms" | "push";
  fallback: boolean;
  providerMsgId?: string;
  errorCode?: string;
}
