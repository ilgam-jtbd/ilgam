"use server";

// /internal/employers Server Actions — 구인자 승인/반려 (ADR-009)
// 모든 액션은 app.log_operator_action() 으로 operator_actions 에 기록.
// 다중 가드 (iter02 QA High):
// 1. requirePlatformAdmin: active=true admin + MFA 4h 이내 (Server Action POST 도 layout 우회 불가)
// 2. Zod 입력 검증 (UUID + reason length + idem key 패턴)
// 3. 멱등키로 더블 클릭/봇 자동화 dedup
// 4. 권한·검증 실패 시 negative 이벤트 기록 (audit trail)

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";

const employerIdSchema = z.string().uuid();
const reasonSchema = z
  .string()
  .trim()
  .max(500)
  .transform((s) => (s.length === 0 ? null : s))
  .nullable();
const idemKeySchema = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/);

// per-process LRU dedup. 분산 환경 강화는 operator_actions(idem_key unique) 추가 마이그레이션 필요.
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

  const mfaAge = admin.last_mfa_at
    ? Date.now() - new Date(admin.last_mfa_at).getTime()
    : Infinity;
  if (mfaAge > 4 * 60 * 60 * 1000) redirect("/internal/mfa-reauth");

  return { supabase, admin };
}

async function logDenied(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  actionType: string,
  targetId: string | null,
  reason: string,
) {
  await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: `${actionType}_denied`,
    p_target_table: "employers",
    p_target_id: targetId,
    p_reason: reason,
    p_metadata: { denied: true },
  });
}

const inputShape = z.object({
  employer_id: employerIdSchema,
  reason: reasonSchema,
  idem_key: idemKeySchema,
});

function readInput(formData: FormData) {
  return inputShape.safeParse({
    employer_id: formData.get("employer_id"),
    reason: formData.get("reason") ?? "",
    idem_key: formData.get("idem_key"),
  });
}

export async function approveEmployer(formData: FormData) {
  const { supabase } = await requirePlatformAdmin();
  const parsed = readInput(formData);
  if (!parsed.success) {
    await logDenied(supabase, "employer_approve", null, "invalid_input");
    redirect("/internal/employers?error=invalid_input");
  }
  if (!consumeIdem(parsed.data.idem_key)) {
    redirect("/internal/employers?ok=approved"); // 더블 클릭 — 첫 요청 결과로 안내
  }

  const { error: updErr } = await supabase
    .from("employers")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", parsed.data.employer_id)
    .is("approved_at", null);
  if (updErr) {
    await logDenied(supabase, "employer_approve", parsed.data.employer_id, updErr.message);
    redirect(`/internal/employers?error=${encodeURIComponent(updErr.message)}`);
  }

  const { error: logErr } = await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: "employer_approve",
    p_target_table: "employers",
    p_target_id: parsed.data.employer_id,
    p_reason: parsed.data.reason,
    p_metadata: { idem_key: parsed.data.idem_key },
  });
  if (logErr) {
    redirect(
      `/internal/employers?warn=${encodeURIComponent(`승인됨, 감사기록 실패: ${logErr.message}`)}`,
    );
  }

  revalidatePath("/internal/employers");
  redirect("/internal/employers?ok=approved");
}

export async function rejectEmployer(formData: FormData) {
  const { supabase } = await requirePlatformAdmin();
  const parsed = readInput(formData);
  if (!parsed.success) {
    await logDenied(supabase, "employer_reject", null, "invalid_input");
    redirect("/internal/employers?error=invalid_input");
  }
  if (!parsed.data.reason) {
    await logDenied(supabase, "employer_reject", parsed.data.employer_id, "missing_reason");
    redirect("/internal/employers?error=missing_reason");
  }
  if (!consumeIdem(parsed.data.idem_key)) {
    redirect("/internal/employers?ok=rejected");
  }

  const { error: updErr } = await supabase
    .from("employers")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", parsed.data.employer_id)
    .is("approved_at", null);
  if (updErr) {
    await logDenied(supabase, "employer_reject", parsed.data.employer_id, updErr.message);
    redirect(`/internal/employers?error=${encodeURIComponent(updErr.message)}`);
  }

  const { error: logErr } = await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: "employer_reject",
    p_target_table: "employers",
    p_target_id: parsed.data.employer_id,
    p_reason: parsed.data.reason,
    p_metadata: { idem_key: parsed.data.idem_key },
  });
  if (logErr) {
    redirect(
      `/internal/employers?warn=${encodeURIComponent(`반려됨, 감사기록 실패: ${logErr.message}`)}`,
    );
  }

  revalidatePath("/internal/employers");
  redirect("/internal/employers?ok=rejected");
}
