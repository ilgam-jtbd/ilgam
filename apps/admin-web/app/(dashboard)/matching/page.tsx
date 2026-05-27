import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { StatusSelect, ContractAmountInput, AssignExpertPanel, AdminNotesInput } from "./MatchingActions";

interface Assignment {
  id: string;
  expert_name: string;
  expert_title: string | null;
  note: string | null;
}

interface Inquiry {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  industry: string | null;
  project_title: string;
  description: string | null;
  budget_krw: number | null;
  duration: string | null;
  skills: string[];
  urgent: boolean;
  nda_required: boolean;
  status: string;
  admin_notes: string | null;
  contract_amount_krw: number | null;
  created_at: string;
  b2b_assignments: Assignment[];
}

const STATUS_ORDER: Record<string, number> = {
  new: 0, reviewing: 1, matched: 2, contracted: 3, completed: 4, closed: 5,
};

async function fetchInquiries(): Promise<{ inquiries: Inquiry[]; stats: { total: number; active: number; gmv: number } }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const { data } = await supabase
    .from("b2b_inquiries")
    .select("*, b2b_assignments(id, expert_name, expert_title, note)")
    .order("created_at", { ascending: false });

  const inquiries = (data ?? []) as unknown as Inquiry[];
  const active = inquiries.filter((i) => !["completed", "closed"].includes(i.status)).length;
  const gmv = inquiries
    .filter((i) => ["contracted", "completed"].includes(i.status))
    .reduce((s, i) => s + (i.contract_amount_krw ?? 0), 0);

  return { inquiries, stats: { total: inquiries.length, active, gmv } };
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { month: "short", day: "numeric", timeZone: "Asia/Seoul" });
}

const INDUSTRY_LABELS: Record<string, string> = {
  shipbuilding: "조선·해양", it: "IT·테크", healthcare: "헬스케어",
  finance: "금융·투자", energy: "에너지", manufacturing: "제조·플랜트",
  startup: "스타트업",
};

function cell(content: React.ReactNode, style?: React.CSSProperties) {
  return (
    <td style={{
      padding: "14px 16px", verticalAlign: "top",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      fontSize: "0.78rem", color: "#cbd5e0",
      ...style,
    }}>
      {content}
    </td>
  );
}

export default async function MatchingPage() {
  const { inquiries, stats } = await fetchInquiries();

  const sorted = [...inquiries].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{
          fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem",
          letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem",
        }}>
          B2B Matching · 수동 운영
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f8f5f0", margin: 0 }}>
          매칭 운영 어드민
        </h1>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "전체 인테이크", value: stats.total.toString(), unit: "건", accent: "#c9a84c" },
          { label: "진행중", value: stats.active.toString(), unit: "건", accent: "#f97316" },
          { label: "누적 계약 GMV", value: `${stats.gmv.toLocaleString("ko-KR")}만`, unit: "원", accent: "#2dd4bf" },
        ].map((m) => (
          <div key={m.label} style={{
            background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "1rem 1.25rem",
          }}>
            <div style={{
              fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.6rem",
              letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.4rem",
            }}>
              {m.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: m.accent }}>{m.value}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {inquiries.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.3)",
          fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.75rem",
        }}>
          아직 접수된 프로젝트가 없습니다
        </div>
      ) : (
        <div style={{
          background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["기업 / 프로젝트", "산업", "예산", "기간", "상태", "계약금(만원)", "배정 전문가", "메모", "접수일"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.6rem",
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)", fontWeight: 500,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((inq) => (
                  <tr key={inq.id} style={{ transition: "background 0.1s" }}>
                    {cell(
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ fontWeight: 600, color: "#f8f5f0", fontSize: "0.8rem" }}>
                            {inq.company_name}
                          </span>
                          {inq.urgent && (
                            <span style={{
                              fontSize: "0.58rem", fontFamily: "var(--font-dm-mono), monospace",
                              letterSpacing: "0.1em", color: "#f97316",
                              background: "rgba(249,115,22,0.1)", padding: "1px 6px", borderRadius: "4px",
                            }}>
                              URGENT
                            </span>
                          )}
                          {inq.nda_required && (
                            <span style={{
                              fontSize: "0.58rem", fontFamily: "var(--font-dm-mono), monospace",
                              letterSpacing: "0.1em", color: "#a78bfa",
                              background: "rgba(167,139,250,0.1)", padding: "1px 6px", borderRadius: "4px",
                            }}>
                              NDA
                            </span>
                          )}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", marginBottom: "4px" }}>
                          {inq.project_title}
                        </div>
                        {inq.contact_name && (
                          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                            {inq.contact_name}{inq.contact_email ? ` · ${inq.contact_email}` : ""}
                          </div>
                        )}
                        {inq.skills.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "4px" }}>
                            {inq.skills.map((s) => (
                              <span key={s} style={{
                                fontSize: "0.6rem", padding: "1px 6px", borderRadius: "4px",
                                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)",
                              }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>,
                      { minWidth: "220px" },
                    )}
                    {cell(
                      <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                        {INDUSTRY_LABELS[inq.industry ?? ""] ?? inq.industry ?? "—"}
                      </span>,
                    )}
                    {cell(
                      inq.budget_krw ? (
                        <span style={{ fontFamily: "var(--font-dm-mono), monospace", color: "#c9a84c" }}>
                          {inq.budget_krw.toLocaleString("ko-KR")}만
                        </span>
                      ) : "—",
                    )}
                    {cell(<span style={{ color: "rgba(255,255,255,0.5)" }}>{inq.duration ?? "—"}</span>)}
                    {cell(<StatusSelect inquiryId={inq.id} current={inq.status} />)}
                    {cell(<ContractAmountInput inquiryId={inq.id} current={inq.contract_amount_krw} />)}
                    {cell(
                      <AssignExpertPanel inquiryId={inq.id} initial={inq.b2b_assignments} />,
                      { minWidth: "180px" },
                    )}
                    {cell(
                      <AdminNotesInput inquiryId={inq.id} current={inq.admin_notes} />,
                      { minWidth: "180px" },
                    )}
                    {cell(
                      <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                        {formatDate(inq.created_at)}
                      </span>,
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
