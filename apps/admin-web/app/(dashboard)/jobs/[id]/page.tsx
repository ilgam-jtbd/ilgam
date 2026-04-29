// RSC · 공고 상세 + 지원자 큐 (RLS 로 employer 자동 필터)
// ADR-003: force-dynamic + no-store · Server Action 으로 수락/거절

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";
import { acceptApplication, rejectApplication } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

type Job = {
  id: string;
  title: string;
  description: string | null;
  dong_code: string;
  shift_start_at: string;
  shift_end_at: string;
  hourly_wage_krw: number;
  headcount: number;
  status: string;
  required_cert_codes: string[];
  preferred_mentor_tags: string[];
};

type Application = {
  id: string;
  worker_id: string;
  status: string;
  created_at: string | null;
};

type Match = {
  id: string;
  worker_id: string;
  confirmed_at: string;
  cancelled_at: string | null;
};

async function loadData(jobId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (_: CookieTuple[]) => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: job }, { data: apps }, { data: matches }] = await Promise.all([
    supabase
      .from("jobs")
      .select(
        "id, title, description, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, headcount, status, required_cert_codes, preferred_mentor_tags"
      )
      .eq("id", jobId)
      .maybeSingle(),
    supabase
      .from("job_applications")
      .select("id, worker_id, status, created_at")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select("id, worker_id, confirmed_at, cancelled_at")
      .eq("job_id", jobId),
  ]);

  return {
    job: job as Job | null,
    apps: (apps ?? []) as Application[],
    matches: (matches ?? []) as Match[],
  };
}

function formatKrw(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
function formatDateTime(iso: string) {
  const d = new Date(iso);
  const t = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${t(d.getMonth() + 1)}-${t(d.getDate())} ${t(d.getHours())}:${t(d.getMinutes())}`;
}

const STATUS_LABEL: Record<string, string> = {
  open: "모집중",
  matched: "매칭완료",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};

export default async function JobDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await props.params;
  const { ok, error } = await props.searchParams;
  const { job, apps, matches } = await loadData(id);
  if (!job) notFound();

  const confirmedMatches = matches.filter((m) => !m.cancelled_at);
  const pendingApps = apps.filter((a) => a.status === "applied");
  const otherApps = apps.filter((a) => a.status !== "applied");

  return (
    <section>
      <div style={{ marginBottom: spacing.md }}>
        <Link href="/jobs" style={{ color: colors.navy[600], textDecoration: "none", fontSize: typography.sizes.sm }}>
          ← 공고 목록
        </Link>
      </div>

      <header style={{ marginBottom: spacing.xl }}>
        <h1 style={{ fontSize: typography.sizes.xl, color: colors.navy[800], margin: 0 }}>
          {job.title}
        </h1>
        <p style={{ color: colors.gray[600], margin: `${spacing.xs}px 0 0` }}>
          {STATUS_LABEL[job.status] ?? job.status} · {job.dong_code} ·{" "}
          {formatDateTime(job.shift_start_at)} – {formatDateTime(job.shift_end_at)}
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          style={{
            padding: spacing.md,
            background: "#FFF3CD",
            border: "1px solid #F0AD4E",
            borderRadius: 8,
            marginBottom: spacing.lg,
            color: "#856404",
          }}
        >
          {error}
        </div>
      ) : null}
      {ok === "accepted" ? (
        <div
          style={{
            padding: spacing.md,
            background: "#D4EDDA",
            border: `1px solid ${colors.success}`,
            borderRadius: 8,
            marginBottom: spacing.lg,
            color: "#155724",
          }}
        >
          지원을 수락했습니다. 매칭이 생성되었습니다.
        </div>
      ) : null}
      {ok === "rejected" ? (
        <div
          style={{
            padding: spacing.md,
            background: colors.gray[100],
            borderRadius: 8,
            marginBottom: spacing.lg,
            color: colors.gray[700],
          }}
        >
          지원을 거절 처리했습니다.
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <div style={{ padding: spacing.md, background: colors.white, border: `1px solid ${colors.gray[200]}`, borderRadius: 8 }}>
          <div style={{ color: colors.gray[600], fontSize: typography.sizes.sm }}>시급</div>
          <div style={{ color: colors.navy[800], fontSize: typography.sizes.lg, fontWeight: 700 }}>
            {formatKrw(job.hourly_wage_krw)}
          </div>
        </div>
        <div style={{ padding: spacing.md, background: colors.white, border: `1px solid ${colors.gray[200]}`, borderRadius: 8 }}>
          <div style={{ color: colors.gray[600], fontSize: typography.sizes.sm }}>모집 인원</div>
          <div style={{ color: colors.navy[800], fontSize: typography.sizes.lg, fontWeight: 700 }}>
            {confirmedMatches.length} / {job.headcount}
          </div>
        </div>
        <div style={{ padding: spacing.md, background: colors.white, border: `1px solid ${colors.gray[200]}`, borderRadius: 8 }}>
          <div style={{ color: colors.gray[600], fontSize: typography.sizes.sm }}>지원자</div>
          <div style={{ color: colors.navy[800], fontSize: typography.sizes.lg, fontWeight: 700 }}>
            {apps.length}명
          </div>
        </div>
      </div>

      {job.description ? (
        <section style={{ marginBottom: spacing.xl }}>
          <h2 style={{ fontSize: typography.sizes.md, color: colors.navy[800] }}>업무 설명</h2>
          <p style={{ color: colors.gray[700], whiteSpace: "pre-wrap" }}>{job.description}</p>
        </section>
      ) : null}

      <section style={{ marginBottom: spacing.xl }}>
        <h2 style={{ fontSize: typography.sizes.md, color: colors.navy[800] }}>
          대기 중 지원 ({pendingApps.length})
        </h2>
        {pendingApps.length === 0 ? (
          <div style={{ padding: spacing.xl, background: colors.gray[50], borderRadius: 8, color: colors.gray[600] }}>
            새 지원이 없습니다.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: spacing.sm }}>
            {pendingApps.map((a) => (
              <li
                key={a.id}
                style={{
                  padding: spacing.md,
                  background: colors.white,
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ color: colors.navy[900], fontFamily: "monospace" }}>
                    worker · {a.worker_id.slice(0, 8)}…
                  </div>
                  <div style={{ color: colors.gray[500], fontSize: typography.sizes.xs }}>
                    {a.created_at ? formatDateTime(a.created_at) : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: spacing.sm }}>
                  <form action={acceptApplication}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <input type="hidden" name="job_id" value={job.id} />
                    <button
                      type="submit"
                      style={{
                        padding: `${spacing.sm}px ${spacing.lg}px`,
                        background: colors.navy[700],
                        color: colors.white,
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: "pointer",
                        minHeight: 40,
                      }}
                    >
                      수락
                    </button>
                  </form>
                  <form action={rejectApplication}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <input type="hidden" name="job_id" value={job.id} />
                    <button
                      type="submit"
                      style={{
                        padding: `${spacing.sm}px ${spacing.lg}px`,
                        background: colors.white,
                        color: colors.gray[700],
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: "pointer",
                        minHeight: 40,
                      }}
                    >
                      거절
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {otherApps.length > 0 ? (
        <section>
          <h2 style={{ fontSize: typography.sizes.md, color: colors.navy[600] }}>
            처리된 지원 ({otherApps.length})
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: spacing.xs }}>
            {otherApps.map((a) => (
              <li
                key={a.id}
                style={{
                  padding: spacing.sm,
                  background: colors.gray[50],
                  borderRadius: 6,
                  color: colors.gray[600],
                  fontSize: typography.sizes.sm,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: "monospace" }}>worker · {a.worker_id.slice(0, 8)}…</span>
                <span>{a.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
