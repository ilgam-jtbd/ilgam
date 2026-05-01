// 어드민 — 정산 현황 페이지 (RSC)
// PortOne 결제 내역 + GMV·수수료·지급액 요약
// 시간 표시: KST(Asia/Seoul) 기준

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface PaymentRow {
  id: string;
  shift_id: string | null;
  gross_amount_krw: number;
  platform_fee_krw: number;
  worker_net_krw: number;
  status: string;
  settled_at: string | null;
  portone_imp_uid: string | null;
  shifts: {
    matches: {
      jobs: { title: string } | null;
      workers: { profiles: { display_name: string | null } | null } | null;
    } | null;
  } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:       { label: "대기",   color: "#718096" },
  authorized:    { label: "승인",   color: "#a78bfa" },
  paid:          { label: "완료",   color: "#4ade80" },
  failed:        { label: "실패",   color: "#f87171" },
  refunded:      { label: "환불",   color: "#fb923c" },
};

const KST_TZ = "Asia/Seoul";

function krw(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}백만`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  return n.toLocaleString("ko-KR");
}

function fmtKST(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: KST_TZ,
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default async function PaymentsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id, shift_id, gross_amount_krw, platform_fee_krw, worker_net_krw,
      status, settled_at, portone_imp_uid,
      shifts (
        matches (
          jobs ( title ),
          workers ( profiles ( display_name ) )
        )
      )
    `)
    .gte("created_at", since30d)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (payments ?? []) as unknown as PaymentRow[];

  const paid = rows.filter((r) => r.status === "paid");
  const summary = {
    gmv: paid.reduce((s, r) => s + r.gross_amount_krw, 0),
    fee: paid.reduce((s, r) => s + r.platform_fee_krw, 0),
    payout: paid.reduce((s, r) => s + r.worker_net_krw, 0),
    count: paid.length,
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem" }}>
          Payments · 최근 30일 · KST
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          정산 현황
        </h1>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "30일 GMV",    value: krw(summary.gmv),    unit: "원", color: "#c9a84c" },
          { label: "수수료 수익",  value: krw(summary.fee),    unit: "원", color: "#2dd4bf" },
          { label: "워커 지급액",  value: krw(summary.payout), unit: "원", color: "#4ade80" },
          { label: "완료 건수",    value: summary.count.toLocaleString(), unit: "건", color: "#a78bfa" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: "12px", padding: "1.2rem" }}>
            <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.6rem", color: "#0d1b2a" }}>{value}</div>
            <div style={{ fontSize: "0.72rem", color: "#718096", marginTop: "2px" }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* 수수료율 배너 */}
      {summary.gmv > 0 && (
        <div style={{ background: "#0d1b2a", borderRadius: "10px", padding: "1rem 1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#2dd4bf", letterSpacing: "0.18em" }}>FEE RATE</span>
          <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.4rem", color: "#c9a84c" }}>
            {((summary.fee / summary.gmv) * 100).toFixed(1)}%
          </span>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>GMV 대비 플랫폼 수수료율</span>
        </div>
      )}

      {/* 거래 테이블 */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              {["정산일시 (KST)", "워커", "공고", "총액", "수수료", "지급액", "상태"].map((h) => (
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
                  최근 30일 정산 데이터가 없습니다
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const job = row.shifts?.matches?.jobs;
              const profile = row.shifts?.matches?.workers?.profiles;
              const st = STATUS_LABEL[row.status] ?? { label: row.status, color: "#718096" };
              return (
                <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>{fmtKST(row.settled_at)}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 600, color: "#0d1b2a" }}>
                    {profile?.display_name ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#0d1b2a" }}>
                    {job?.title ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 600, color: "#0d1b2a" }}>
                    {row.gross_amount_krw.toLocaleString()}원
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#2dd4bf" }}>
                    {row.platform_fee_krw.toLocaleString()}원
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4ade80" }}>
                    {row.worker_net_krw.toLocaleString()}원
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
