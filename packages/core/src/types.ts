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

export interface EmployerMember {
  employer_id: string;
  profile_id: string;
  role: "owner" | "member";
  created_at: string;
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  created_at: string;
}

export type MatchStatus = "confirmed" | "cancelled" | "no_show";

export interface Match {
  id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  status: MatchStatus;
  created_at: string;
}

export type JobStatus = "open" | "matched" | "in_progress" | "completed" | "cancelled";

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  dong_code: string;
  shift_start_at: string;
  shift_end_at: string;
  hourly_wage_krw: number;
  required_cert_codes: string[];
  preferred_mentor_tags: string[];
  headcount: number;
  status: JobStatus;
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

export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

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
