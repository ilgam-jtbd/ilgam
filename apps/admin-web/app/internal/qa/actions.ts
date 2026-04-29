"use server";

// /internal/qa Server Actions — 컨텐츠 QA 결정 (ADR-010 Tier 3)
// 운영자가 flagged/pending 공고에 대해 승인/반려 결정.
// 모든 결정은 jobs.qa_* 갱신 + operator_actions 에 기록 (ADR-009 audit trail).

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";

const decisionSchema = z.object({
  job_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().max(500),
  idem_key: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
});

const seenIdem = new Map<string, number>();
const IDEM_TTL_MS = 5 * 60_000;
function consumeIdem(key: string): boolean {
  const now = Date.now();
  for (const [k, t] of seenIdem) if (now - t > IDEM_TTL_MS) seenIdem.delete(k);
  if (seenIdem.has(key)) return false;
  seenIdem.set(key, now);
  return true;
}

async function requirePlatformAdmin() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/forbidden");

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("profile_id, active, role, mfa_enrolled, last_mfa_at")
    .eq("profile_id", user.id)
    .eq("active", true)
    .single();
  if (!admin) redirect("/auth/forbidden");
  if (!admin.mfa_enrolled) redirect("/internal/mfa-setup");

  const mfaAge = admin.last_mfa_at ? Date.now() - new Date(admin.last_mfa_at).getTime() : Infinity;
  if (mfaAge > 4 * 60 * 60 * 1000) redirect("/internal/mfa-reauth");

  return { supabase, admin };
}

export async function decideQa(formData: FormData) {
  const { supabase, admin } = await requirePlatformAdmin();

  const parsed = decisionSchema.safeParse({
    job_id: formData.get("job_id"),
    decision: formData.get("decision"),
    reason: formData.get("reason") ?? "",
    idem_key: formData.get("idem_key"),
  });
  if (!parsed.success) {
    redirect("/internal/qa?error=invalid_input");
  }
  if (!consumeIdem(parsed.data.idem_key)) {
    redirect(`/internal/qa?ok=${parsed.data.decision}`);
  }

  // jobs.qa_* 갱신
  const { error: updErr } = await supabase
    .from("jobs")
    .update({
      qa_status: parsed.data.decision,
      qa_classifier: "operator",
      qa_reason: parsed.data.reason,
      qa_reviewed_by: admin.profile_id,
      qa_reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.job_id);
  if (updErr) {
    redirect(`/internal/qa?error=${encodeURIComponent(updErr.message)}`);
  }

  // 감사 기록
  await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: "qa_decision",
    p_target_table: "jobs",
    p_target_id: parsed.data.job_id,
    p_reason: parsed.data.reason,
    p_metadata: { decision: parsed.data.decision, idem_key: parsed.data.idem_key },
  });

  revalidatePath("/internal/qa");
  redirect(`/internal/qa?ok=${parsed.data.decision}`);
}
