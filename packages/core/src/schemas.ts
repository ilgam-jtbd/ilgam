import { z } from "zod";

export const PhoneE164 = z.string().regex(/^\+82[0-9]{9,10}$/, "한국 E.164 형식");

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
});

export const WorkerPreferencesSchema = z.object({
  home_dong_code: z.string().length(10),
  cert_codes: z.array(z.string()),
  mentor_tags: z.array(z.string()),
  preferred_weekdays: z.array(z.number().int().min(0).max(6)),
  preferred_verticals: z.array(z.enum(["logistics", "retail", "fnb"])),
});

export const ClockInSchema = z.object({
  shift_id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  selfie_storage_path: z.string().min(1),
});

export type JobCreate = z.infer<typeof JobCreateSchema>;
export type WorkerPreferences = z.infer<typeof WorkerPreferencesSchema>;
export type ClockIn = z.infer<typeof ClockInSchema>;
