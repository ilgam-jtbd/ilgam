// 어드민 — 근무 현황 페이지 (RSC)
// 매칭 확정 후 실제 출근·퇴근 체크 현황 조회

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface ShiftRow {
  id: string;
  match_id: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  status: string;
  selfie_in_path: string | null;
  selfie_out_path: string | null;
  matches: {
    job_id: string;
    worker_id: string;
    jobs: { title: string; shift_start_at: string; shift_end_at: string; hourly_wage_krw: number } | null;
    workers: { profiles: { display_name: string | null; phone_e164: string | null } | null } | null;
  } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:     { label: "대기",   color: "#718096" },
  clocked_in:  { label: "근무 중", color: "#2dd4bf" },
  clocked_out: { label: "완료",   color: "#4ade80" },
  no_show:     { label: "노쇼",   color: "#f87171" },
  disputed:    { label: "분쟁",   color: "#fb923c" },
};

const KST_TZ = "Asia/Seoul";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: KST_TZ,
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function calcHours(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return `${diff.toFixed(1)}h`;
}

export default async function ShiftsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: shifts } = await supabase
    .from("shifts")
    .select(`
      id, match_id, clock_in_at, clock_out_at, status, selfie_in_path, selfie_out_path,
      matches (
        job_id, worker_id,
        jobs ( title, shift_start_at, shift_end_at, hourly_wage_krw ),
        workers ( profiles ( display_name, phone_e164 ) )
      )
    `)
    .gte("created_at", since7d)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (shifts ?? []) as unknown as ShiftRow[];

  const summary = {
    total: rows.length,
    clocked_in: rows.filter((r) => r.status === "clocked_in").length,
    clocked_out: rows.filter((r) => r.status === "clocked_out").length,
    no_show: rows.filter((r) => r.status === "no_show").length,
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem" }}>
          Shifts · 최근 7일 · KST
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          근무 현황
        </h1>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "전체", value: summary.total, color: "#c9a84c" },
          { label: "근무 중", value: summary.clocked_in, color: "#2dd4bf" },
          { label: "완료", value: summary.clocked_out, color: "#4ade80" },
          { label: "노쇼", value: summary.no_show, color: "#f87171" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: "12px", padding: "1.2rem" }}>
            <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.6rem", color: "#0d1b2a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              {["워커", "공고", "예정 시간", "출근", "퇴근", "실 근무", "상태"].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#718096", fontSize: "0.875rem" }}>
                  최근 7일 근무 데이터가 없습니다
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const job = row.matches?.jobs;
              const profile = row.matches?.workers?.profiles;
              const st = STATUS_LABEL[row.status] ?? { label: row.status, color: "#718096" };
              return (
                <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{profile?.display_name ?? "—"}</div>
                    <div style={{ fontSize: "0.72rem", color: "#718096" }}>{profile?.phone_e164 ?? ""}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#0d1b2a" }}>
                    {job?.title ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>
                    {fmt(job?.shift_start_at ?? null)}<br />
                    <span style={{ color: "#718096" }}>~{fmt(job?.shift_end_at ?? null)}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>
                    {fmt(row.clock_in_at)}
                    {row.selfie_in_path && <span style={{ marginLeft: "4px", fontSize: "0.65rem", color: "#2dd4bf" }}>📷</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>
                    {fmt(row.clock_out_at)}
                    {row.selfie_out_path && <span style={{ marginLeft: "4px", fontSize: "0.65rem", color: "#2dd4bf" }}>📷</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#0d1b2a", fontWeight: 600 }}>
                    {calcHours(row.clock_in_at, row.clock_out_at)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", background: `${st.color}20`, color: st.color, fontSize: "0.72rem", fontFamily: "var(--font-dm-mono), monospace", letterSpacing: "0.05em" }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
