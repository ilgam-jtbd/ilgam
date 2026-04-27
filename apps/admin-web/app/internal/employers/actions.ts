"use server";

// /internal/employers Server Actions — 구인자 승인/반려 (ADR-009)
// 모든 액션은 app.log_operator_action() 으로 operator_actions 에 기록.
// RLS: platform_admins.active=true 본인만 통과 (helper 가 검사).

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";

export async function approveEmployer(formData: FormData) {
  const employerId = String(formData.get("employer_id") ?? "");
  const reason = String(formData.get("reason") ?? "").slice(0, 500) || null;
  if (!employerId) redirect("/internal/employers?error=missing_id");

  const supabase = await getServerSupabase();

  const { error: updErr } = await supabase
    .from("employers")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", employerId)
    .is("approved_at", null);
  if (updErr) {
    redirect(`/internal/employers?error=${encodeURIComponent(updErr.message)}`);
  }

  // 감사 로그 — RLS 우회 SECURITY DEFINER (app.log_operator_action)
  const { error: logErr } = await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: "employer_approve",
    p_target_table: "employers",
    p_target_id: employerId,
    p_reason: reason,
    p_metadata: {},
  });
  if (logErr) {
    // 감사 실패 시 alert: 운영자 액션 자체는 성공했으나 추적 누락 → 무시하지 않고 노출.
    redirect(`/internal/employers?warn=${encodeURIComponent(`승인됨, 감사기록 실패: ${logErr.message}`)}`);
  }

  revalidatePath("/internal/employers");
  redirect("/internal/employers?ok=approved");
}

export async function rejectEmployer(formData: FormData) {
  const employerId = String(formData.get("employer_id") ?? "");
  const reason = String(formData.get("reason") ?? "").slice(0, 500) || null;
  if (!employerId) redirect("/internal/employers?error=missing_id");

  const supabase = await getServerSupabase();

  // 반려 = suspended_at 설정 + approved_at 유지 NULL
  const { error: updErr } = await supabase
    .from("employers")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", employerId)
    .is("approved_at", null);
  if (updErr) {
    redirect(`/internal/employers?error=${encodeURIComponent(updErr.message)}`);
  }

  const { error: logErr } = await supabase.schema("app").rpc("log_operator_action", {
    p_action_type: "employer_reject",
    p_target_table: "employers",
    p_target_id: employerId,
    p_reason: reason,
    p_metadata: {},
  });
  if (logErr) {
    redirect(`/internal/employers?warn=${encodeURIComponent(`반려됨, 감사기록 실패: ${logErr.message}`)}`);
  }

  revalidatePath("/internal/employers");
  redirect("/internal/employers?ok=rejected");
}
