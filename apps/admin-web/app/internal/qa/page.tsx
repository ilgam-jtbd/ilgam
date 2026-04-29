// RSC · 컨텐츠 QA 큐 (ADR-009 v2 P0 · ADR-010)
// 분당 5~10건 처리 목표. 운영자 첫 화면 (홈 리다이렉트 대상).
// pending + flagged 공고 표시 + Claude 추천 결과 + 승인/반려 버튼.

import type { Job, JobCategory } from "@ilgam/core";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_LETTER } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";
import { getServerSupabase } from "@/lib/supabase-server";
import { isDemoMode } from "@/lib/demo";
import { FlashBanner, type FlashSearch } from "@/components/ui/FlashBanner";
import { decideQa } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type QueueRow = Pick<
  Job,
  | "id"
  | "title"
  | "description"
  | "hourly_wage_krw"
  | "shift_start_at"
  | "shift_end_at"
  | "dong_code"
  | "dong_label"
  | "category"
  | "qa_status"
  | "qa_reason"
  | "qa_classifier"
  | "qa_confidence"
>;

const DEMO_QUEUE: QueueRow[] = [
  {
    id: "demo-job-1",
    title: "강서구 쿠팡 물류센터 피킹 보조 (시니어 환영)",
    description: "지게차 불필요. 가벼운 물품 분류·피킹. 4시간 근무, 점심 제공.",
    hourly_wage_krw: 12000,
    shift_start_at: new Date(Date.now() + 86_400_000).toISOString(),
    shift_end_at: new Date(Date.now() + 86_400_000 + 4 * 3600_000).toISOString(),
    dong_code: "1150010100",
    dong_label: "강서구 마곡동",
    category: "logistics",
    qa_status: "pending",
    qa_reason: null,
    qa_classifier: null,
    qa_confidence: null,
  },
  {
    id: "demo-job-2",
    title: "AI 스타트업 시니어 기술자문 (전직 삼성/LG 임원 우대)",
    description: "시리즈 A 스타트업의 ML/플랫폼 아키텍처 월 4회 자문, 멘토링 포함.",
    hourly_wage_krw: 200000,
    shift_start_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    shift_end_at: new Date(Date.now() + 7 * 86_400_000 + 4 * 3600_000).toISOString(),
    dong_code: "1168010100",
    dong_label: "강남구 역삼동",
    category: "consulting",
    qa_status: "flagged",
    qa_reason: "low_confidence_approved (consulting 카테고리 신규)",
    qa_classifier: "claude",
    qa_confidence: 0.78,
  },
  {
    id: "demo-job-3",
    title: "간단한 업무 / 시간 자유 / 고수익 보장",
    description: "자세한 내용은 카카오톡으로 문의: oo-link.com",
    hourly_wage_krw: 30000,
    shift_start_at: new Date(Date.now() + 86_400_000).toISOString(),
    shift_end_at: new Date(Date.now() + 86_400_000 + 4 * 3600_000).toISOString(),
    dong_code: "1129010100",
    dong_label: "성북구 정릉동",
    category: null,
    qa_status: "flagged",
    qa_reason: "vague+external_link",
    qa_classifier: "claude",
    qa_confidence: 0.72,
  },
];

async function loadQueue(): Promise<QueueRow[]> {
  if (isDemoMode) return DEMO_QUEUE;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, hourly_wage_krw, shift_start_at, shift_end_at, dong_code, dong_label, category, qa_status, qa_reason, qa_classifier, qa_confidence",
    )
    .in("qa_status", ["pending", "flagged"])
    .order("qa_classifier", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) {
    console.warn("[internal/qa] load:", error.message);
    return [];
  }
  return (data ?? []) as QueueRow[];
}

function formatKrw(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
function formatDateKo(iso: string): string {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}) ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function CategoryChip({ category }: { category: JobCategory | null }) {
  if (!category) {
    return (
      <span
        style={{
          fontSize: typography.sizes.xs,
          color: colors.gray[600],
          padding: `2px ${spacing.sm}px`,
          borderRadius: radius.full,
          border: `1px solid ${colors.gray[300]}`,
        }}
      >
        분류없음
      </span>
    );
  }
  return (
    <span
      aria-label={JOB_CATEGORY_LABEL[category]}
      style={{
        fontSize: typography.sizes.xs,
        color: colors.navy[700],
        background: colors.navy[50],
        padding: `2px ${spacing.sm}px`,
        borderRadius: radius.full,
        fontWeight: typography.weights.medium,
      }}
    >
      [{JOB_CATEGORY_LETTER[category]}] {JOB_CATEGORY_LABEL[category]}
    </span>
  );
}

function QaBadge({
  status,
  classifier,
  confidence,
}: {
  status: QueueRow["qa_status"];
  classifier: QueueRow["qa_classifier"];
  confidence: QueueRow["qa_confidence"];
}) {
  const map = {
    pending: { label: "대기", bg: colors.warning },
    flagged: { label: "검토필요", bg: colors.danger },
    approved: { label: "승인됨", bg: colors.success },
    rejected: { label: "반려됨", bg: colors.gray[600] },
  };
  const m = map[status];
  return (
    <span
      style={{
        fontSize: typography.sizes.xs,
        color: colors.white,
        background: m.bg,
        padding: `2px ${spacing.sm}px`,
        borderRadius: radius.full,
        fontWeight: typography.weights.medium,
      }}
    >
      {m.label}
      {classifier === "claude" && confidence != null
        ? ` · AI ${Math.round(confidence * 100)}%`
        : null}
    </span>
  );
}

export default async function QaPage(props: { searchParams: Promise<FlashSearch> }) {
  const search = await props.searchParams;
  const queue = await loadQueue();

  return (
    <section>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: spacing.xl,
          flexWrap: "wrap",
          gap: spacing.md,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: typography.sizes.xl,
              color: colors.navy[900],
              margin: 0,
              fontWeight: typography.weights.bold,
            }}
          >
            컨텐츠 QA 큐
          </h1>
          <p
            style={{
              color: colors.gray[600],
              margin: `${spacing.xs}px 0 0`,
              fontSize: typography.sizes.sm,
            }}
          >
            ADR-010 Tier 3 · 분당 5~10건 처리 목표 · 자동(Claude)·수동 분기
          </p>
        </div>
        <span style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
          큐 {queue.length}건
        </span>
      </header>

      <FlashBanner search={search} />

      {queue.length === 0 ? (
        <div
          style={{
            padding: spacing.xxl,
            background: colors.white,
            borderRadius: radius.md,
            boxShadow: shadow.sm,
            color: colors.gray[600],
            textAlign: "center" as const,
          }}
        >
          처리할 공고가 없습니다. 잘 하고 계세요.
        </div>
      ) : (
        <div style={{ display: "grid", gap: spacing.lg }}>
          {queue.map((job) => (
            <article
              key={job.id}
              style={{
                background: colors.white,
                borderRadius: radius.md,
                boxShadow: shadow.sm,
                padding: spacing.lg,
                borderLeft: `4px solid ${
                  job.qa_status === "flagged" ? colors.danger : colors.warning
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: spacing.md,
                  flexWrap: "wrap",
                  marginBottom: spacing.md,
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.sm,
                      marginBottom: spacing.xs,
                      flexWrap: "wrap",
                    }}
                  >
                    <CategoryChip category={job.category} />
                    <QaBadge
                      status={job.qa_status}
                      classifier={job.qa_classifier}
                      confidence={job.qa_confidence}
                    />
                  </div>
                  <h2
                    style={{
                      fontSize: typography.sizes.md,
                      color: colors.navy[800],
                      fontWeight: typography.weights.bold,
                      margin: 0,
                    }}
                  >
                    {job.title}
                  </h2>
                  {job.description && (
                    <p
                      style={{
                        fontSize: typography.sizes.sm,
                        color: colors.gray[700],
                        margin: `${spacing.xs}px 0 0`,
                        lineHeight: 1.5,
                      }}
                    >
                      {job.description}
                    </p>
                  )}
                  <dl
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: `${spacing.xs}px ${spacing.lg}px`,
                      marginTop: spacing.sm,
                      fontSize: typography.sizes.xs,
                      color: colors.gray[600],
                    }}
                  >
                    <div>
                      <dt style={{ display: "inline", color: colors.gray[500] }}>시급 </dt>
                      <dd
                        style={{
                          display: "inline",
                          margin: 0,
                          fontWeight: typography.weights.medium,
                        }}
                      >
                        {formatKrw(job.hourly_wage_krw)}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ display: "inline", color: colors.gray[500] }}>시간 </dt>
                      <dd style={{ display: "inline", margin: 0 }}>
                        {formatDateKo(job.shift_start_at)} ~ {new Date(job.shift_end_at).getHours()}
                        시
                      </dd>
                    </div>
                    <div>
                      <dt style={{ display: "inline", color: colors.gray[500] }}>장소 </dt>
                      <dd style={{ display: "inline", margin: 0 }}>
                        {job.dong_label ?? job.dong_code}
                      </dd>
                    </div>
                  </dl>
                  {job.qa_reason && (
                    <div
                      style={{
                        marginTop: spacing.sm,
                        padding: spacing.sm,
                        background: colors.gray[50],
                        borderRadius: radius.sm,
                        fontSize: typography.sizes.xs,
                        color: colors.gray[700],
                      }}
                    >
                      <strong>AI 분류 사유</strong>: {job.qa_reason}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                <form
                  action={decideQa}
                  style={{ display: "flex", gap: spacing.sm, flex: 1, minWidth: 280 }}
                >
                  <input type="hidden" name="job_id" value={job.id} />
                  <input type="hidden" name="decision" value="approved" />
                  <input type="hidden" name="idem_key" value={`qa_apv_${job.id}_${Date.now()}`} />
                  <input
                    type="text"
                    name="reason"
                    placeholder="승인 메모 (선택)"
                    aria-label={`${job.title} 승인 메모`}
                    maxLength={500}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      minHeight: 40,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`,
                      background: colors.success,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                      minHeight: 40,
                    }}
                    aria-label={`${job.title} 승인`}
                  >
                    승인
                  </button>
                </form>
                <form
                  action={decideQa}
                  style={{ display: "flex", gap: spacing.sm, flex: 1, minWidth: 280 }}
                >
                  <input type="hidden" name="job_id" value={job.id} />
                  <input type="hidden" name="decision" value="rejected" />
                  <input type="hidden" name="idem_key" value={`qa_rej_${job.id}_${Date.now()}`} />
                  <input
                    type="text"
                    name="reason"
                    placeholder="반려 사유 (필수)"
                    aria-label={`${job.title} 반려 사유`}
                    required
                    maxLength={500}
                    style={{
                      flex: 1,
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      minHeight: 40,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`,
                      background: colors.danger,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.sm,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                      minHeight: 40,
                    }}
                    aria-label={`${job.title} 반려`}
                  >
                    반려
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      <p
        style={{
          marginTop: spacing.xl,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        모든 결정은 operator_actions 에 자동 기록됩니다 (qa_decision · ADR-009/010).
      </p>
    </section>
  );
}
