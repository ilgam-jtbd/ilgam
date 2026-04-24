// RSC · 신고 티켓 3트랙 처리 (ADR-009 스크린 2, ADR-008 연계)
// 트랙: 가짜공고 · 급여미지급 · 개인정보요구
// 실 구현: cx_tickets WHERE status = 'open' 연결 + shadow_hide / block_employer 액션.

import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

type ReportTrack = "fake_job" | "wage_unpaid" | "personal_info_demand";

interface ReportTicket {
  id: string;
  track: ReportTrack;
  job_title: string;
  reporter_summary: string;
  reported_at: string;
  priority: "high" | "normal";
}

const TRACK_META: Record<
  ReportTrack,
  { label: string; color: string; sla: string; action: string }
> = {
  fake_job: {
    label: "가짜 공고",
    color: colors.danger,
    sla: "48시간",
    action: "공고 Shadow Hide",
  },
  wage_unpaid: {
    label: "급여 미지급",
    color: colors.warning,
    sla: "7영업일",
    action: "구인자 신규 게시 차단",
  },
  personal_info_demand: {
    label: "개인정보 요구",
    color: colors.info,
    sla: "2시간",
    action: "우선순위 상향",
  },
};

const STUB_TICKETS: ReportTicket[] = [
  {
    id: "t-0001",
    track: "personal_info_demand",
    job_title: "강서 쿠팡 피킹 04/26",
    reporter_summary: "구인자가 주민번호 앞자리 요구",
    reported_at: "2026-04-24T09:15:00Z",
    priority: "high",
  },
  {
    id: "t-0002",
    track: "fake_job",
    job_title: "송파 베이커리 프렙 04/25",
    reporter_summary: "동일 사업자번호 중복 신고 2건",
    reported_at: "2026-04-24T08:30:00Z",
    priority: "normal",
  },
  {
    id: "t-0003",
    track: "wage_unpaid",
    job_title: "성북 물류센터 04/20",
    reporter_summary: "4월 20일 완료 매칭 정산 미수령",
    reported_at: "2026-04-23T18:00:00Z",
    priority: "normal",
  },
];

const TABS: { key: ReportTrack | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "personal_info_demand", label: "개인정보 요구" },
  { key: "fake_job", label: "가짜 공고" },
  { key: "wage_unpaid", label: "급여 미지급" },
];

export default function ReportsPage() {
  // 실 구현 시 searchParams.track으로 탭 필터링
  const tickets = STUB_TICKETS;

  return (
    <section>
      <h1
        style={{
          fontSize: typography.sizes.xl,
          color: colors.navy[900],
          margin: 0,
          marginBottom: spacing.xl,
          fontWeight: typography.weights.bold,
        }}
      >
        신고 티켓 처리
      </h1>

      {/* 트랙별 요약 배지 */}
      <div
        style={{
          display: "flex",
          gap: spacing.md,
          marginBottom: spacing.xl,
          flexWrap: "wrap",
        }}
      >
        {(Object.keys(TRACK_META) as ReportTrack[]).map((track) => {
          const count = tickets.filter((t) => t.track === track).length;
          const meta = TRACK_META[track];
          return (
            <div
              key={track}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
                background: colors.white,
                borderRadius: radius.sm,
                boxShadow: shadow.sm,
                padding: `${spacing.sm}px ${spacing.md}px`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: radius.full,
                  background: meta.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>
                {meta.label}
              </span>
              <span
                style={{
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                  color: meta.color,
                }}
              >
                {count}건
              </span>
              <span style={{ fontSize: typography.sizes.xs, color: colors.gray[400] }}>
                SLA {meta.sla}
              </span>
            </div>
          );
        })}
      </div>

      {/* 탭 (클라이언트 상태로 전환 예정 · 현재 href 방식) */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: spacing.lg,
          borderBottom: `2px solid ${colors.gray[200]}`,
        }}
      >
        {TABS.map((tab) => (
          <a
            key={tab.key}
            href={`/internal/reports${tab.key === "all" ? "" : `?track=${tab.key}`}`}
            style={{
              padding: `${spacing.sm}px ${spacing.lg}px`,
              fontSize: typography.sizes.sm,
              color: colors.navy[700],
              textDecoration: "none",
              borderBottom: `2px solid transparent`,
              marginBottom: -2,
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 티켓 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
        {tickets.map((ticket) => {
          const meta = TRACK_META[ticket.track];
          return (
            <div
              key={ticket.id}
              style={{
                background: colors.white,
                borderRadius: radius.md,
                boxShadow: shadow.sm,
                padding: spacing.lg,
                borderLeft: `4px solid ${meta.color}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: spacing.md,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                    <span
                      style={{
                        fontSize: typography.sizes.xs,
                        color: colors.white,
                        background: meta.color,
                        padding: `2px ${spacing.sm}px`,
                        borderRadius: radius.full,
                        fontWeight: typography.weights.medium,
                      }}
                    >
                      {meta.label}
                    </span>
                    {ticket.priority === "high" && (
                      <span
                        style={{
                          fontSize: typography.sizes.xs,
                          color: colors.danger,
                          fontWeight: typography.weights.bold,
                        }}
                      >
                        긴급
                      </span>
                    )}
                    <span style={{ fontSize: typography.sizes.xs, color: colors.gray[400] }}>
                      #{ticket.id}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.navy[800],
                      fontWeight: typography.weights.medium,
                      marginTop: spacing.sm,
                    }}
                  >
                    {ticket.job_title}
                  </div>
                  <div
                    style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      marginTop: spacing.xs,
                    }}
                  >
                    {ticket.reporter_summary}
                  </div>
                  <div
                    style={{
                      fontSize: typography.sizes.xs,
                      color: colors.gray[400],
                      marginTop: spacing.sm,
                    }}
                  >
                    신고 시각: {new Date(ticket.reported_at).toLocaleString("ko-KR")}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                  <button
                    type="button"
                    style={{
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      background: meta.color,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.xs,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                      whiteSpace: "nowrap",
                    }}
                    aria-label={`${ticket.id} ${meta.action}`}
                  >
                    {meta.action}
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: `${spacing.sm}px ${spacing.md}px`,
                      background: colors.gray[100],
                      color: colors.gray[700],
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.xs,
                      cursor: "pointer",
                    }}
                    aria-label={`${ticket.id} 종결`}
                  >
                    종결
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          marginTop: spacing.xl,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        실 데이터: cx_tickets WHERE status = 'open' 연결 예정.
        액션 시 operator_actions (report_shadow_hide / report_block_employer / report_resolve) 기록.
        SLA: 개인정보 2h · 가짜공고 48h · 급여미지급 7영업일 (ADR-008).
      </p>
    </section>
  );
}
