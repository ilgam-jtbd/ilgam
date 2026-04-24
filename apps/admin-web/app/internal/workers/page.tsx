// RSC · 워커 ban/unban 관리 (ADR-009 스크린 4)
// ban ≤30일: operator 가능 / 영구 ban·unban: super_admin 전용
// operator_actions + audit_log 이중 기록 (ADR-009 "이중 기록 규칙")

import type { Worker } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

interface WorkerWithStatus extends Worker {
  display_name: string;
  phone_e164: string;
  ban_expires_at: string | null;
  ban_reason: string | null;
  is_banned: boolean;
}

const STUB_WORKERS: WorkerWithStatus[] = [
  {
    id: "w-0001",
    profile_id: "p-0001",
    ci_token: null,
    birth_ymd: "19620315",
    gender_code: "M",
    home_dong_code: "1165010100",
    cert_codes: ["forklift_1"],
    mentor_tags: ["logistics"],
    no_show_count: 3,
    rating_avg: 3.2,
    display_name: "김노쇼",
    phone_e164: "+821011112222",
    ban_expires_at: null,
    ban_reason: "노쇼 3회 누적",
    is_banned: false,
  },
  {
    id: "w-0002",
    profile_id: "p-0002",
    ci_token: null,
    birth_ymd: "19580922",
    gender_code: "F",
    home_dong_code: "1174010500",
    cert_codes: [],
    mentor_tags: ["fnb"],
    no_show_count: 0,
    rating_avg: null,
    display_name: "박신고",
    phone_e164: "+821033334444",
    ban_expires_at: "2026-05-10T00:00:00Z",
    ban_reason: "가짜 공고 신고 허위 접수",
    is_banned: true,
  },
];

function BanStatusBadge({ isBanned, expiresAt }: { isBanned: boolean; expiresAt: string | null }) {
  if (!isBanned) {
    return (
      <span
        style={{
          fontSize: typography.sizes.xs,
          color: colors.success,
          background: colors.success + "20",
          padding: `2px ${spacing.sm}px`,
          borderRadius: radius.full,
        }}
      >
        활성
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: typography.sizes.xs,
        color: colors.danger,
        background: colors.danger + "20",
        padding: `2px ${spacing.sm}px`,
        borderRadius: radius.full,
      }}
    >
      {expiresAt
        ? `정지 (~${new Date(expiresAt).toLocaleDateString("ko-KR")})`
        : "영구 정지"}
    </span>
  );
}

export default function WorkersPage() {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.xl,
        }}
      >
        <h1
          style={{
            fontSize: typography.sizes.xl,
            color: colors.navy[900],
            margin: 0,
            fontWeight: typography.weights.bold,
          }}
        >
          워커 ban 관리
        </h1>
      </div>

      <div
        style={{
          background: colors.info + "15",
          border: `1px solid ${colors.info}`,
          borderRadius: radius.sm,
          padding: spacing.md,
          marginBottom: spacing.xl,
          fontSize: typography.sizes.sm,
          color: colors.gray[800],
        }}
      >
        ban ≤30일: operator 권한. 영구 ban·unban: super_admin 전용.
        모든 ban 액션은 사유 필수 + operator_actions·audit_log 이중 기록.
      </div>

      <div
        style={{
          background: colors.white,
          borderRadius: radius.md,
          boxShadow: shadow.sm,
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 220px",
            padding: `${spacing.md}px ${spacing.lg}px`,
            background: colors.gray[100],
            fontSize: typography.sizes.xs,
            color: colors.gray[600],
            fontWeight: typography.weights.medium,
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}
        >
          <span>워커</span>
          <span>노쇼 수</span>
          <span>평점</span>
          <span>상태</span>
          <span>액션</span>
        </div>

        {STUB_WORKERS.map((worker, idx) => (
          <div
            key={worker.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 220px",
              padding: `${spacing.lg}px ${spacing.lg}px`,
              alignItems: "center",
              borderBottom:
                idx < STUB_WORKERS.length - 1
                  ? `1px solid ${colors.gray[100]}`
                  : "none",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.navy[800],
                  fontWeight: typography.weights.medium,
                }}
              >
                {worker.display_name}
              </div>
              {worker.ban_reason && (
                <div
                  style={{
                    fontSize: typography.sizes.xs,
                    color: colors.gray[500],
                    marginTop: spacing.xs,
                  }}
                >
                  사유: {worker.ban_reason}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: typography.sizes.sm,
                color: worker.no_show_count >= 3 ? colors.danger : colors.gray[700],
                fontWeight: worker.no_show_count >= 3 ? typography.weights.bold : typography.weights.regular,
              }}
            >
              {worker.no_show_count}회
            </div>
            <div style={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>
              {worker.rating_avg != null ? `${worker.rating_avg.toFixed(1)}점` : "—"}
            </div>
            <div>
              <BanStatusBadge isBanned={worker.is_banned} expiresAt={worker.ban_expires_at} />
            </div>
            <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
              {worker.is_banned ? (
                <button
                  type="button"
                  style={{
                    padding: `${spacing.xs}px ${spacing.md}px`,
                    background: colors.success,
                    color: colors.white,
                    border: "none",
                    borderRadius: radius.sm,
                    fontSize: typography.sizes.xs,
                    cursor: "pointer",
                    fontWeight: typography.weights.medium,
                  }}
                  aria-label={`${worker.display_name} unban (SA 전용)`}
                >
                  해제 (SA 전용)
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    style={{
                      padding: `${spacing.xs}px ${spacing.md}px`,
                      background: colors.warning,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.xs,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                    }}
                    aria-label={`${worker.display_name} 30일 정지`}
                  >
                    30일 정지
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: `${spacing.xs}px ${spacing.md}px`,
                      background: colors.danger,
                      color: colors.white,
                      border: "none",
                      borderRadius: radius.sm,
                      fontSize: typography.sizes.xs,
                      cursor: "pointer",
                      fontWeight: typography.weights.medium,
                    }}
                    aria-label={`${worker.display_name} 영구 정지 (SA 전용)`}
                  >
                    영구 정지 (SA 전용)
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: spacing.lg,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        실 데이터: workers JOIN profiles, ban_expires_at 필터 연결 예정.
        ban 액션: operator_actions (worker_ban / worker_unban) + audit_log 이중 기록.
        만료일 + 사유 필수 입력 → Server Action modal로 구현 예정.
      </p>
    </section>
  );
}
