"use server";

// 지원자 수락/거절 — RLS 로 job.employer_id IN current_employer_ids() 보장.
// Accept 시 트랜잭션: job_applications.status='selected' + matches insert + headcount 만큼 채워지면 job.status='matched'.
// ADR-005: 권한 경계는 RLS; 경합은 unique(job_id, worker_id) + update-with-check 로 단일 acceptor 보증.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

async function sb() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function acceptApplication(formData: FormData) {
  const applicationId = String(formData.get("application_id") ?? "");
  const jobId = String(formData.get("job_id") ?? "");
  if (!applicationId || !jobId) redirect(`/jobs/${jobId}?error=missing_ids`);

  const supabase = await sb();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 1) 지원 정보 조회 (RLS: employer 만 조회 가능)
  const { data: app } = await supabase
    .from("job_applications")
    .select("id, job_id, worker_id, status")
    .eq("id", applicationId)
    .maybeSingle();
  if (!app || app.job_id !== jobId) {
    redirect(`/jobs/${jobId}?error=application_not_found`);
  }
  if (app.status !== "applied") {
    redirect(`/jobs/${jobId}?error=already_processed`);
  }

  // 2) 공고 조회 (employer_id + headcount + status)
  const { data: job } = await supabase
    .from("jobs")
    .select("id, employer_id, headcount, status")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) redirect(`/jobs/${jobId}?error=job_not_found`);
  if (job.status === "cancelled" || job.status === "completed") {
    redirect(`/jobs/${jobId}?error=job_closed`);
  }

  // 3) 낙관 락: status 가 'applied' 일 때만 'selected' 로 전환 (중복 Accept 방어)
  const { error: updErr, data: updated } = await supabase
    .from("job_applications")
    .update({ status: "selected" })
    .eq("id", applicationId)
    .eq("status", "applied")
    .select("id")
    .maybeSingle();
  if (updErr || !updated) {
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(updErr?.message ?? "race_condition")}`);
  }

  // 4) matches insert (unique(job_id, worker_id) 로 중복 방어)
  const { error: matchErr } = await supabase.from("matches").insert({
    job_id: jobId,
    worker_id: app.worker_id,
    employer_id: job.employer_id,
  });
  if (matchErr) {
    // 롤백: 지원 상태 복구
    await supabase
      .from("job_applications")
      .update({ status: "applied" })
      .eq("id", applicationId);
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(matchErr.message)}`);
  }

  // 5) headcount 만큼 채워졌으면 공고 상태 갱신
  const { count } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .is("cancelled_at", null);
  if ((count ?? 0) >= job.headcount && job.status === "open") {
    await supabase.from("jobs").update({ status: "matched" }).eq("id", jobId);
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/jobs`);
  redirect(`/jobs/${jobId}?ok=accepted`);
}

export async function rejectApplication(formData: FormData) {
  const applicationId = String(formData.get("application_id") ?? "");
  const jobId = String(formData.get("job_id") ?? "");
  const supabase = await sb();

  const { error } = await supabase
    .from("job_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)
    .eq("status", "applied");
  if (error) redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}?ok=rejected`);
}
