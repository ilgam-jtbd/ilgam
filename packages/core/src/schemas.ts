import { z } from "zod";

export const PhoneE164 = z.string().regex(/^\+82[0-9]{9,10}$/, "한국 E.164 형식");

export const JobCategoryEnum = z.enum([
  "logistics",
  "food",
  "cleaning",
  "retail",
  "care",
  "agriculture",
  "consulting", // 욜드족 자문, ADR-002 v2.1
]);

export const QaStatusEnum = z.enum(["pending", "approved", "rejected", "flagged"]);

export const JobCreateSchema = z.object({
  title: z.string().min(2).max(60),
  description: z.string().max(2000).optional(),
  dong_code: z.string().length(10),
  shift_start_at: z.string().datetime(),
  shift_end_at: z.string().datetime(),
  hourly_wage_krw: z.number().int().min(10030), // 2026 최저임금
  required_cert_codes: z.array(z.string()).default([]),
  preferred_mentor_tags: z.array(z.string()).default([]),
  headcount: z.number().int().positive().default(1),
  category: JobCategoryEnum.optional(),
  // qa_status 는 default 'pending' (DB 0006). 클라이언트는 절대 명시 금지.
});

export const WorkerPreferencesSchema = z.object({
  home_dong_code: z.string().length(10),
  cert_codes: z.array(z.string()),
  mentor_tags: z.array(z.string()),
  preferred_weekdays: z.array(z.number().int().min(0).max(6)),
  preferred_verticals: z.array(JobCategoryEnum),
});

export const ClockInSchema = z.object({
  shift_id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  selfie_storage_path: z.string().min(1),
});

// ADR-010 외부 신고 (워커·구인자·시민)
export const ContentReportSchema = z.object({
  job_id: z.string().uuid(),
  reporter_role: z.enum(["worker", "employer", "operator", "external"]),
  category: z.string().min(2).max(50), // adult, gambling, mlm, fraud, illegal, info_demand, wage_unpaid 등
  description: z.string().trim().max(1000).optional(),
});

export type JobCreate = z.infer<typeof JobCreateSchema>;
export type WorkerPreferences = z.infer<typeof WorkerPreferencesSchema>;
export type ClockIn = z.infer<typeof ClockInSchema>;
export type ContentReportCreate = z.infer<typeof ContentReportSchema>;
