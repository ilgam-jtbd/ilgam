// RSC · 고용주 대시보드 홈 (통계 요약)
// ADR-003: force-dynamic + no-store — 사용자별 데이터
// ADR-005: RLS 3축 — authenticated 사용자의 current_employer_ids() 로 자동 필터

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

type Stats = {
  openJobs: number;
  matchedJobs: number;
  inProgressJobs: number;
  completedShiftsThisMonth: number;
  totalPayoutThisMonthKrw: number;
};

async function loadStats(): Promise<Stats> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (_cookiesToSet: CookieTuple[]) => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [openRes, matchedRes, inProgressRes, completedRes, payoutRes] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "matched"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .not("clock_out_at", "is", null)
      .gte("clock_in_at", monthStart),
    supabase
      .from("payments")
      .select("worker_net_krw")
      .eq("status", "paid")
      .gte("settled_at", monthStart),
  ]);

  const totalPayout = (payoutRes.data ?? []).reduce(
    (sum, row: { worker_net_krw: number | null }) => sum + (row.worker_net_krw ?? 0),
    0
  );

  return {
    openJobs: openRes.count ?? 0,
    matchedJobs: matchedRes.count ?? 0,
    inProgressJobs: inProgressRes.count ?? 0,
    completedShiftsThisMonth: completedRes.count ?? 0,
    totalPayoutThisMonthKrw: totalPayout,
  };
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: spacing.xl,
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: 12,
        background: colors.white,
      }}
    >
      <div style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>{label}</div>
      <div
        style={{
          marginTop: spacing.sm,
          fontSize: typography.sizes.xxl,
          fontWeight: 700,
          color: accent ?? colors.navy[800],
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ marginTop: spacing.xs, fontSize: typography.sizes.xs, color: colors.gray[500] }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default async function DashboardHome() {
  const s = await loadStats();

  return (
    <section>
      <header style={{ marginBottom: spacing.xl }}>
        <h1 style={{ fontSize: typography.sizes.xl, color: colors.navy[800], margin: 0 }}>
          대시보드
        </h1>
        <p style={{ color: colors.gray[600], margin: `${spacing.xs}px 0 0` }}>
          이번 달 실적 요약과 진행 중 공고 현황
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: spacing.lg,
          marginBottom: spacing.xxl,
        }}
      >
        <StatCard label="모집중 공고" value={`${s.openJobs}건`} accent={colors.success} />
        <StatCard label="매칭 완료" value={`${s.matchedJobs}건`} accent={colors.info} />
        <StatCard label="진행중" value={`${s.inProgressJobs}건`} accent={colors.warning} />
        <StatCard
          label="이번 달 완료 근무"
          value={`${s.completedShiftsThisMonth}건`}
          hint="clock_in 기준 월 누적"
        />
        <StatCard
          label="이번 달 지급액"
          value={`${s.totalPayoutThisMonthKrw.toLocaleString("ko-KR")}원`}
          hint="정산 완료 합계"
        />
      </div>

      <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
        <Link
          href="/jobs/new"
          style={{
            padding: `${spacing.md}px ${spacing.xl}px`,
            background: colors.navy[700],
            color: colors.white,
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          새 공고 등록
        </Link>
        <Link
          href="/jobs"
          style={{
            padding: `${spacing.md}px ${spacing.xl}px`,
            background: colors.white,
            color: colors.navy[700],
            border: `1px solid ${colors.navy[200]}`,
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          공고 목록 보기
        </Link>
      </div>
    </section>
  );
}
