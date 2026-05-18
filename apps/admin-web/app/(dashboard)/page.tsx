// 어드민 대시보드 홈 — GMV·수수료·매칭 수 실시간 집계 (BM 에이전트 요청)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface DashMetrics {
  gmv_30d: number;
  fee_30d: number;
  matches_30d: number;
  open_jobs: number;
  pending_applicants: number;
  pending_employers: number;
  active_workers: number;
}

async function fetchMetrics(): Promise<DashMetrics> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [payments, matches, openJobs, pendingApps, pendingEmployers, activeWorkers] = await Promise.all([
    supabase.from("payments").select("gross_amount_krw, platform_fee_krw")
      .eq("status", "paid").gte("settled_at", since30d),
    supabase.from("matches").select("id", { count: "exact", head: true })
      .gte("created_at", since30d),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("job_applications").select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("employer_applications").select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("workers").select("id", { count: "exact", head: true })
      .gt("no_show_count", -1),
  ]);

  const gmv = (payments.data ?? []).reduce((s, r) => s + (r.gross_amount_krw ?? 0), 0);
  const fee = (payments.data ?? []).reduce((s, r) => s + (r.platform_fee_krw ?? 0), 0);

  return {
    gmv_30d: gmv,
    fee_30d: fee,
    matches_30d: matches.count ?? 0,
    open_jobs: openJobs.count ?? 0,
    pending_applicants: pendingApps.count ?? 0,
    pending_employers: pendingEmployers.count ?? 0,
    active_workers: activeWorkers.count ?? 0,
  };
}

function krw(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}백만`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  return n.toLocaleString("ko-KR");
}

const METRICS = [
  { key: "gmv_30d",           label: "30일 GMV",       unit: "원",  accent: "#c9a84c" },
  { key: "fee_30d",           label: "30일 수수료",     unit: "원",  accent: "#2dd4bf" },
  { key: "matches_30d",       label: "30일 완료 매칭",  unit: "건",  accent: "#4ade80" },
  { key: "open_jobs",          label: "모집 중 공고",    unit: "건",  accent: "#c9a84c" },
  { key: "pending_applicants", label: "대기 지원자",     unit: "명",  accent: "#f87171" },
  { key: "pending_employers",  label: "구인자 심사 대기", unit: "건",  accent: "#fb923c" },
  { key: "active_workers",     label: "등록 워커",       unit: "명",  accent: "#2dd4bf" },
] as const;

export default async function DashboardHomePage() {
  const m = await fetchMetrics();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem",
          letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem",
        }}>
          Overview · 실시간
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          대시보드
        </h1>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem",
        marginBottom: "2rem",
      }}>
        {METRICS.map(({ key, label, unit, accent }) => (
          <div key={key} style={{
            background: "#ffffff", border: "1px solid #e2e8f0",
            borderTop: `3px solid ${accent}`, borderRadius: "12px", padding: "1.4rem",
          }}>
            <div style={{
              fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem",
              color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem",
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a",
            }}>
              {key === "gmv_30d" || key === "fee_30d" ? krw(m[key]) : m[key].toLocaleString()}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#718096", marginTop: "0.2rem" }}>{unit}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <a href="/applicants" style={{
          background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "3px solid #f87171",
          borderRadius: "12px", padding: "1.4rem", textDecoration: "none", display: "block",
        }}>
          <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#991b1b", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            ACTION REQUIRED
          </div>
          <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.92rem" }}>
            대기 지원자 {m.pending_applicants}명 검토
          </div>
          <div style={{ fontSize: "0.75rem", color: "#718096", marginTop: "0.3rem" }}>
            승인하면 즉시 알림톡 발송
          </div>
        </a>
        <a href="/jobs" style={{
          background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "3px solid #c9a84c",
          borderRadius: "12px", padding: "1.4rem", textDecoration: "none", display: "block",
        }}>
          <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#92400e", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            JOBS
          </div>
          <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.92rem" }}>
            공고 {m.open_jobs}건 모집 중
          </div>
          <div style={{ fontSize: "0.75rem", color: "#718096", marginTop: "0.3rem" }}>
            재게시로 워커를 빠르게 확보
          </div>
        </a>
        {m.pending_employers > 0 && (
          <a href="/employers" style={{
            background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "3px solid #fb923c",
            borderRadius: "12px", padding: "1.4rem", textDecoration: "none", display: "block",
          }}>
            <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#c2410c", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
              ACTION REQUIRED
            </div>
            <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.92rem" }}>
              구인자 심사 대기 {m.pending_employers}건
            </div>
            <div style={{ fontSize: "0.75rem", color: "#718096", marginTop: "0.3rem" }}>
              사업자 서류 확인 후 승인/반려
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
