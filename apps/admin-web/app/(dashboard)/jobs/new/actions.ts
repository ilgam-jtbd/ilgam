"use server";

// 고용주 공고 등록 Server Action
// ADR-005: RLS 가 employer_id IN current_employer_ids() 로 권한 강제 — 잘못된 employer_id 로는 insert 자체가 불가
// Zod: @ilgam/core JobCreateSchema 로 서버 검증 (2026 최저임금 ₩10,030 CHECK 와 이중 방어)

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JobCreateSchema } from "@ilgam/core";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

function toIsoOrNull(local: string | null): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createJob(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookieTuple[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = {
    employer_id: String(formData.get("employer_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: (formData.get("description") as string | null) || undefined,
    dong_code: String(formData.get("dong_code") ?? ""),
    shift_start_at: toIsoOrNull(formData.get("shift_start_at") as string | null) ?? "",
    shift_end_at: toIsoOrNull(formData.get("shift_end_at") as string | null) ?? "",
    hourly_wage_krw: Number(formData.get("hourly_wage_krw") ?? 0),
    required_cert_codes: String(formData.get("required_cert_codes") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    preferred_mentor_tags: String(formData.get("preferred_mentor_tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    headcount: Number(formData.get("headcount") ?? 1),
  };

  const parsed = JobCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    redirect(`/jobs/new?error=${encodeURIComponent(first?.message ?? "invalid")}`);
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: raw.employer_id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      dong_code: parsed.data.dong_code,
      shift_start_at: parsed.data.shift_start_at,
      shift_end_at: parsed.data.shift_end_at,
      hourly_wage_krw: parsed.data.hourly_wage_krw,
      required_cert_codes: parsed.data.required_cert_codes,
      preferred_mentor_tags: parsed.data.preferred_mentor_tags,
      headcount: parsed.data.headcount,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[jobs/new] insert failed:", error);
    redirect(`/jobs/new?error=${encodeURIComponent(error?.message ?? "insert_failed")}`);
  }

  redirect("/jobs");
}
