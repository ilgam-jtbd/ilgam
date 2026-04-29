// RSC · 구인자 승인 큐 (ADR-009 스크린 1)
// 실 데이터: employers WHERE approved_at IS NULL (RLS · platform_admin only)
// 승인/반려 → Server Action + app.log_operator_action() 기록.

import type { Employer } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";
import { getServerSupabase } from "@/lib/supabase-server";
import { isDemoMode, DEMO_PENDING_EMPLOYERS } from "@/lib/demo";
import { FlashBanner, type FlashSearch } from "@/components/ui/FlashBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { approveEmployer, rejectEmployer } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function loadPending(): Promise<Employer[]> {
  if (isDemoMode) return DEMO_PENDING_EMPLOYERS;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("employers")
    .select("id, biz_name, contact_name, contact_phone_e164, biz_type, approved_at, suspended_at")
    .is("approved_at", null)
    .is("suspended_at", null)
    .order("biz_name");
  if (error) {
    console.warn("[internal/employers] load:", error.message);
    return [];
  }
  return (data ?? []) as Employer[];
}

type Search = FlashSearch;

export default async function EmployersPage(props: { searchParams: Promise<Search> }) {
  const search = await props.searchParams;
  const employers = await loadPending();

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.xl,
          flexWrap: "wrap",
          gap: spacing.md,
        }}
      >
        <h1
          style={{
            fontSize: typography.sizes.xl,
            color: colors.navy[900],
            margin: 0,
            fontWeight: typography.weights.bold,
          }}
        >
          구인자 승인 큐
        </h1>
        <span style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
          대기 {employers.length}건
        </span>
      </div>

      <FlashBanner search={search} />

      {employers.length === 0 ? (
        <div
          style={{
            padding: spacing.xxl,
            background: colors.white,
            borderRadius: radius.md,
            boxShadow: shadow.sm,
            color: colors.gray[600],
            textAlign: "center" as const,
          }}
        >
          승인 대기 중인 구인자가 없습니다.
        </div>
      ) : (
        <div
          style={{
            background: colors.white,
            borderRadius: radius.md,
            boxShadow: shadow.sm,
            overflow: "hidden",
          }}
        >
          {employers.map((employer, idx) => (
            <div
              key={employer.id}
              style={{
                padding: spacing.lg,
                borderBottom:
                  idx < employers.length - 1 ? `1px solid ${colors.gray[100]}` : "none",
                display: "grid",
                gap: spacing.md,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: spacing.md,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.navy[800],
                      fontWeight: typography.weights.medium,
                    }}
                  >
                    {employer.biz_name}
                  </div>
                  <div
                    style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      marginTop: spacing.xs,
                    }}
                  >
                    {employer.contact_name} · {employer.contact_phone_e164} ·{" "}
                    {employer.biz_type ?? "—"}
                  </div>
                </div>
                <StatusBadge
                  approved={!!employer.approved_at}
                  suspended={!!employer.suspended_at}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  flexWrap: "wrap",
                }}
              >
                <form action={approveEmployer} style={{ display: "flex", gap: spacing.sm, flex: 1, minWidth: 280 }}>
                  <input type="hidden" name="employer_id" value={employer.id} />
                  <input type="hidden" name="idem_key" value={`apv_${employer.id}_${Date.now()}`} />
                  <input
                    type="text"
                    name="reason"
                    maxLength={500}
                    placeholder="승인 메모 (선택)"
                    aria-label={`${employer.biz_name} 승인 메모`}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      minHeight: 40,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`,
                      background: colors.success,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                      minHeight: 40,
                    }}
                    aria-label={`${employer.biz_name} 승인`}
                  >
                    승인
                  </button>
                </form>

                <form action={rejectEmployer} style={{ display: "flex", gap: spacing.sm, flex: 1, minWidth: 280 }}>
                  <input type="hidden" name="employer_id" value={employer.id} />
                  <input type="hidden" name="idem_key" value={`rej_${employer.id}_${Date.now()}`} />
                  <input
                    type="text"
                    name="reason"
                    required
                    maxLength={500}
                    placeholder="반려 사유 (필수)"
                    aria-label={`${employer.biz_name} 반려 사유`}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      minHeight: 40,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`,
                      background: colors.danger,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                      minHeight: 40,
                    }}
                    aria-label={`${employer.biz_name} 반려`}
                  >
                    반려
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          marginTop: spacing.lg,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        승인·반려 모든 액션은 operator_actions 에 자동 기록됩니다 (ADR-009).
      </p>
    </section>
  );
}
