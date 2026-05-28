// admin-web — 지원자 목록 + 1탭 승인/반려 (PRD M1: 구인자 반복공고 1클릭)
// RSC로 지원자 목록 렌더, AcceptButton/RejectButton은 클라이언트 컴포넌트

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ApplicantActions from "./ApplicantActions";

interface Applicant {
  id: string;
  worker_id: string;
  job_id: string;
  status: string;
  created_at: string;
  workers: {
    id: string;
    no_show_count: number;
    rating_avg: number | null;
    profiles: { display_name: string | null; phone_e164: string | null };
  } | null;
  jobs: { title: string; shift_start_at: string } | null;
}

async function fetchApplicants(): Promise<Applicant[]> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const { data, error } = await supabase
    .from("job_applications")
    .select(`
      id, worker_id, job_id, status, created_at,
      workers (
        id, no_show_count, rating_avg,
        profiles ( display_name, phone_e164 )
      ),
      jobs ( title, shift_start_at )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("applicants fetch error", error.message);
    return [];
  }
  return (data ?? []) as unknown as Applicant[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default async function ApplicantsPage() {
  const applicants = await fetchApplicants();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.62rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem",
        }}>
          Applicant Management
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          지원자 검토
        </h1>
        <p style={{ color: "#718096", fontSize: "0.82rem", marginTop: "0.4rem" }}>
          대기 중인 지원자 {applicants.length}명 — 승인 즉시 ILGAM_M001 알림톡 발송
        </p>
      </div>

      {applicants.length === 0 && (
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px",
          padding: "3rem", textAlign: "center", color: "#718096",
        }}>
          <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.2rem", color: "#0d1b2a", marginBottom: "0.5rem" }}>
            대기 중인 지원자가 없습니다
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {applicants.map((a) => {
          const name = a.workers?.profiles?.display_name ?? "미입력";
          const phone = a.workers?.profiles?.phone_e164 ?? "";
          const noShow = a.workers?.no_show_count ?? 0;
          const rating = a.workers?.rating_avg;

          return (
            <div key={a.id} style={{
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderLeft: `3px solid ${noShow >= 2 ? "#f87171" : "#c9a84c"}`,
              borderRadius: "12px", padding: "1.2rem 1.4rem",
              display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0d1b2a", marginBottom: "0.25rem" }}>
                  {name}
                  {noShow > 0 && (
                    <span style={{
                      marginLeft: "0.5rem", background: "rgba(248,113,113,0.15)", color: "#991b1b",
                      borderRadius: "20px", padding: "0.1rem 0.5rem",
                      fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.6rem",
                    }}>
                      노쇼 {noShow}회
                    </span>
                  )}
                  {rating != null && (
                    <span style={{
                      marginLeft: "0.4rem", background: "rgba(201,168,76,0.15)", color: "#92400e",
                      borderRadius: "20px", padding: "0.1rem 0.5rem",
                      fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.6rem",
                    }}>
                      ★ {rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#4a5568" }}>
                  {phone.replace("+82", "0")} · {a.jobs?.title ?? ""} · {a.jobs ? formatDate(a.jobs.shift_start_at) : ""}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#718096", marginTop: "0.2rem",
                  fontFamily: "var(--font-dm-mono), monospace" }}>
                  지원 {formatDate(a.created_at)}
                </div>
              </div>
              <ApplicantActions
                applicationId={a.id}
                workerId={a.worker_id}
                jobId={a.job_id}
                workerPhone={a.workers?.profiles?.phone_e164 ?? ""}
                jobTitle={a.jobs?.title ?? ""}
                shiftStartAt={a.jobs?.shift_start_at ?? ""}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
