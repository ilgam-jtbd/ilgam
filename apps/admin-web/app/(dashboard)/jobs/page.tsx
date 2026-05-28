// RSC · Supabase 서버 컴포넌트 (ADR-003, @supabase/ssr)
// 구인자가 속한 공고 목록 + 재게시 액션 (PRD M1)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Job } from "@ilgam/core";
import RepostButton from "./RepostButton";
import CloseJobButton from "./CloseJobButton";

type JobRow = Pick<
  Job,
  "id" | "title" | "dong_code" | "shift_start_at" | "shift_end_at" | "hourly_wage_krw" | "headcount" | "status"
> & { vertical: string | null; applicant_count: number };

function formatKRW(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

const STATUS_LABELS: Record<string, string> = {
  open:        "모집중",
  matched:     "매칭완료",
  in_progress: "근무중",
  completed:   "완료",
  cancelled:   "취소",
};

const STATUS_COLORS: Record<string, string> = {
  open:        "rgba(45,212,191,0.15)",
  matched:     "rgba(201,168,76,0.15)",
  in_progress: "rgba(74,222,128,0.15)",
  completed:   "rgba(163,163,163,0.15)",
  cancelled:   "rgba(248,113,113,0.15)",
};

const STATUS_TEXT: Record<string, string> = {
  open:        "#0f766e",
  matched:     "#92400e",
  in_progress: "#166534",
  completed:   "#525252",
  cancelled:   "#991b1b",
};

async function fetchJobs(): Promise<JobRow[]> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id, title, dong_code, shift_start_at, shift_end_at,
      hourly_wage_krw, headcount, status, vertical,
      job_applications(count)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("jobs fetch error", error.message);
    return [];
  }

  type RawRow = Omit<JobRow, "applicant_count"> & { job_applications?: { count: number }[] };
  return (data ?? []).map((row: RawRow) => ({
    ...row,
    applicant_count: row.job_applications?.[0]?.count ?? 0,
  }));
}

export default async function JobsPage() {
  const jobs = await fetchJobs();

  return (
    <div>
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#2dd4bf",
              marginBottom: "0.4rem",
            }}
          >
            Job Management
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.8rem",
              color: "#0d1b2a",
            }}
          >
            공고 목록
          </h1>
        </div>
        <a
          href="/jobs/new"
          style={{
            background: "#c9a84c",
            color: "#0d1b2a",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.4rem",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          새 공고 등록
        </a>
      </div>

      {/* 공고 없음 */}
      {jobs.length === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "3rem",
            textAlign: "center",
            color: "#718096",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.2rem",
              color: "#0d1b2a",
              marginBottom: "0.5rem",
            }}
          >
            등록된 공고가 없습니다
          </div>
          <div style={{ fontSize: "0.82rem" }}>
            첫 공고를 등록해 검증된 시니어 워커 풀을 활용해 보십시오.
          </div>
        </div>
      )}

      {/* 공고 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1rem",
        }}
      >
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderLeft: `3px solid ${job.status === "open" ? "#c9a84c" : "#e2e8f0"}`,
              borderRadius: "12px",
              padding: "1.4rem",
            }}
          >
            {/* 상태 배지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.6rem",
              }}
            >
              <span
                style={{
                  background: STATUS_COLORS[job.status] ?? "rgba(163,163,163,0.15)",
                  color: STATUS_TEXT[job.status] ?? "#525252",
                  borderRadius: "20px",
                  padding: "0.15rem 0.6rem",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
              {job.vertical && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.62rem",
                    color: "#718096",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {job.vertical}
                </span>
              )}
            </div>

            {/* 제목 */}
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.92rem",
                color: "#0d1b2a",
                marginBottom: "0.5rem",
                lineHeight: 1.35,
              }}
            >
              {job.title}
            </div>

            {/* 메타 */}
            <div
              style={{
                fontSize: "0.78rem",
                color: "#4a5568",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              <div>{formatDatetime(job.shift_start_at)} ~ {formatDatetime(job.shift_end_at)}</div>
              <div>
                시급{" "}
                <strong style={{ color: "#0d1b2a" }}>
                  {formatKRW(job.hourly_wage_krw)}원
                </strong>
                {" "}· 모집 {job.headcount}명
                {job.applicant_count > 0 && (
                  <span style={{ color: "#2dd4bf", marginLeft: "0.5rem" }}>
                    지원 {job.applicant_count}명
                  </span>
                )}
              </div>
            </div>

            {/* 재게시 / 마감 버튼 (open 공고에만 표시) */}
            {job.status === "open" && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <RepostButton jobId={job.id} />
                <CloseJobButton jobId={job.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
