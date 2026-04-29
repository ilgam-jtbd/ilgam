// RSC · 고용주 대시보드 공고 목록 (RLS 의해 본인 고용주 공고만 노출)
// ADR-003: force-dynamic + no-store (사용자 데이터)
// ADR-005: RLS 3축 — app.current_employer_ids() 가 authenticated 사용자로 필터링

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

type JobRow = {
  id: string;
  title: string;
  dong_code: string;
  shift_start_at: string;
  shift_end_at: string;
  hourly_wage_krw: number;
  headcount: number;
  status: string;
  created_at: string | null;
};

async function listJobs(): Promise<JobRow[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (_cookiesToSet: CookieTuple[]) => {
          // RSC: 쿠키 쓰기는 middleware 가 담당
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS 가 employer_members → current_employer_ids() 로 자동 필터.
  // 50건 이상은 pagination 도입 시 확장.
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, headcount, status, created_at")
    .order("shift_start_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[dashboard/jobs] select failed:", error);
    return [];
  }
  return (data ?? []) as JobRow[];
}

function formatKrw(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}
function formatRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const day = `${s.getMonth() + 1}/${s.getDate()}`;
  const t = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${day} ${t(s)}~${t(e)}`;
}

const STATUS_LABEL: Record<string, string> = {
  open: "모집중",
  matched: "매칭완료",
  in_progress: "진행중",
  completed: "완료",
  cancelled: "취소",
};
const STATUS_COLOR: Record<string, string> = {
  open: colors.success,
  matched: colors.info,
  in_progress: colors.warning,
  completed: colors.gray[500],
  cancelled: colors.gray[400],
};

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <section>
      <header style={{ marginBottom: spacing.xl, display: "flex", alignItems: "baseline", gap: spacing.lg }}>
        <h1 style={{ fontSize: typography.sizes.xl, color: colors.navy[800], margin: 0 }}>공고 목록</h1>
        <span style={{ color: colors.gray[500], fontSize: typography.sizes.sm }}>
          {jobs.length}건
        </span>
      </header>

      {jobs.length === 0 ? (
        <div
          style={{
            padding: spacing.xxxl,
            background: colors.gray[50],
            borderRadius: 8,
            textAlign: "center",
            color: colors.gray[600],
          }}
        >
          등록된 공고가 없습니다. 새 공고를 등록해 시작하세요.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: typography.sizes.sm,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.gray[200]}`, textAlign: "left" }}>
                {["공고명", "지역", "일시", "시급", "인원", "상태"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: `${spacing.md}px ${spacing.sm}px`,
                      color: colors.gray[600],
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px`, color: colors.navy[900] }}>
                    <Link href={`/jobs/${j.id}`} style={{ color: colors.navy[700], textDecoration: "none", fontWeight: 600 }}>
                      {j.title}
                    </Link>
                  </td>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px`, color: colors.gray[700] }}>
                    {j.dong_code}
                  </td>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px`, color: colors.gray[700] }}>
                    {formatRange(j.shift_start_at, j.shift_end_at)}
                  </td>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px`, color: colors.navy[700], fontWeight: 600 }}>
                    {formatKrw(j.hourly_wage_krw)}
                  </td>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px`, color: colors.gray[700] }}>
                    {j.headcount}
                  </td>
                  <td style={{ padding: `${spacing.md}px ${spacing.sm}px` }}>
                    <span
                      style={{
                        padding: `2px ${spacing.sm}px`,
                        borderRadius: 4,
                        background: STATUS_COLOR[j.status] ?? colors.gray[400],
                        color: "#fff",
                        fontSize: typography.sizes.xs,
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABEL[j.status] ?? j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
