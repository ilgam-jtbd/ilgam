// 어드민 — 구인자 승인 페이지 (RSC)
// employer_applications 목록 조회 + 승인/반려 액션
// 시간: KST(Asia/Seoul) 기준

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { EmployerApprovalActions } from "./EmployerApprovalActions";

interface ApplicationRow {
  id: string;
  profile_id: string;
  biz_name: string;
  biz_reg_no: string;
  contact_name: string;
  contact_phone_e164: string;
  biz_type: string | null;
  biz_reg_doc_path: string | null;
  status: string;
  reject_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles: { display_name: string | null; phone_e164: string | null } | null;
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending:  { label: "검토 대기", color: "#c9a84c" },
  approved: { label: "승인",     color: "#4ade80" },
  rejected: { label: "반려",     color: "#f87171" },
};

const KST_TZ = "Asia/Seoul";

function fmtKST(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: KST_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default async function EmployersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const { data: apps } = await supabase
    .from("employer_applications")
    .select(`
      id, profile_id, biz_name, biz_reg_no, contact_name, contact_phone_e164,
      biz_type, biz_reg_doc_path, status, reject_reason, reviewed_at, created_at,
      profiles ( display_name, phone_e164 )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (apps ?? []) as unknown as ApplicationRow[];

  // 서명된 문서 URL 생성 (private 버킷, 유효 1시간)
  const docUrls: Record<string, string> = {};
  const withDocs = rows.filter((r) => r.biz_reg_doc_path);
  if (withDocs.length > 0) {
    const { data: signed } = await supabase.storage
      .from("employer-docs")
      .createSignedUrls(withDocs.map((r) => r.biz_reg_doc_path!), 3600);
    (signed ?? []).forEach((s, i) => {
      if (s.signedUrl) docUrls[withDocs[i].id] = s.signedUrl;
    });
  }

  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const rejected = rows.filter((r) => r.status === "rejected");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem" }}>
          Employers · 구인자 심사
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          구인자 승인 관리
        </h1>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "검토 대기", value: pending.length, color: "#c9a84c" },
          { label: "승인",     value: approved.length, color: "#4ade80" },
          { label: "반려",     value: rejected.length, color: "#f87171" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: "12px", padding: "1.2rem" }}>
            <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 검토 대기 섹션 */}
      {pending.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c9a84c" }} />
            <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.72rem", color: "#92400e", letterSpacing: "0.1em" }}>ACTION REQUIRED — 검토 대기 {pending.length}건</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pending.map((app) => (
              <ApplicationCard key={app.id} app={app} fmtKST={fmtKST} showActions docUrl={docUrls[app.id]} />
            ))}
          </div>
        </div>
      )}

      {/* 전체 목록 */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              {["신청일시 (KST)", "사업체명", "대표자", "연락처", "업종", "상태", ""].map((h) => (
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
                  구인자 신청이 없습니다
                </td>
              </tr>
            )}
            {rows.map((app) => {
              const st = STATUS_CFG[app.status] ?? { label: app.status, color: "#718096" };
              return (
                <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>{fmtKST(app.created_at)}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{app.biz_name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#718096" }}>{app.biz_reg_no}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#0d1b2a" }}>{app.contact_name}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568" }}>{app.contact_phone_e164}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#718096" }}>{app.biz_type ?? "—"}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", background: `${st.color}20`, color: st.color, fontSize: "0.72rem", fontFamily: "var(--font-dm-mono), monospace" }}>
                      {st.label}
                    </span>
                    {app.reject_reason && (
                      <div style={{ fontSize: "0.7rem", color: "#f87171", marginTop: "2px" }}>{app.reject_reason}</div>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {app.status === "pending" && (
                      <EmployerApprovalActions applicationId={app.id} />
                    )}
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

function ApplicationCard({
  app, fmtKST, showActions, docUrl,
}: {
  app: ApplicationRow;
  fmtKST: (s: string | null) => string;
  showActions?: boolean;
  docUrl?: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "1.2rem 1.4rem", border: "1px solid #e2e8f0", borderLeft: "3px solid #c9a84c" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0d1b2a", marginBottom: "4px" }}>{app.biz_name}</div>
          <div style={{ fontSize: "0.8rem", color: "#718096" }}>
            사업자번호: {app.biz_reg_no} · {app.contact_name} · {app.contact_phone_e164}
          </div>
          {app.biz_type && <div style={{ fontSize: "0.72rem", color: "#718096", marginTop: "2px" }}>업종: {app.biz_type}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
            <span style={{ fontSize: "0.72rem", color: "#718096" }}>신청: {fmtKST(app.created_at)}</span>
            {docUrl
              ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.72rem", color: "#2dd4bf",
                    fontFamily: "var(--font-dm-mono), monospace",
                    letterSpacing: "0.06em", textDecoration: "none",
                    border: "1px solid rgba(45,212,191,0.3)", borderRadius: "6px",
                    padding: "2px 8px",
                  }}
                >
                  📄 서류 보기
                </a>
              )
              : (
                <span style={{ fontSize: "0.72rem", color: "#a0aec0", fontFamily: "var(--font-dm-mono), monospace" }}>
                  서류 미첨부
                </span>
              )}
          </div>
        </div>
        {showActions && <EmployerApprovalActions applicationId={app.id} />}
      </div>
    </div>
  );
}
