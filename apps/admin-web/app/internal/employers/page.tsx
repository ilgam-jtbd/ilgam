// RSC · 구인자 승인 큐 (ADR-009 스크린 1)
// 실 구현: supabase.from('employers').select(...).is('approved_at', null) 연결 예정.
// 승인/반려 액션은 Server Action + app.log_operator_action() 호출로 구현.

import type { Employer } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

// 스텁 데이터 — 실 Supabase 쿼리 연결 전 UI 골격 확인용
const STUB_EMPLOYERS: (Employer & { pending_reason?: string })[] = [
  {
    id: "a1b2c3d4-0000-0000-0000-000000000001",
    biz_name: "(주)한빛물류",
    contact_name: "이철수",
    contact_phone_e164: "+821012345678",
    biz_type: "물류·유통",
    approved_at: null,
    suspended_at: null,
    pending_reason: "사업자등록증 확인 대기",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000002",
    biz_name: "본죽 성북점",
    contact_name: "박영희",
    contact_phone_e164: "+821087654321",
    biz_type: "F&B",
    approved_at: null,
    suspended_at: null,
  },
];

function StatusBadge({ approved, suspended }: { approved: boolean; suspended: boolean }) {
  const label = suspended ? "차단" : approved ? "승인됨" : "대기";
  const bg = suspended ? colors.danger : approved ? colors.success : colors.warning;
  return (
    <span
      style={{
        fontSize: typography.sizes.xs,
        color: colors.white,
        background: bg,
        padding: `2px ${spacing.sm}px`,
        borderRadius: radius.full,
        fontWeight: typography.weights.medium,
      }}
    >
      {label}
    </span>
  );
}

export default function EmployersPage() {
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
          구인자 승인 큐
        </h1>
        <span style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
          대기 {STUB_EMPLOYERS.filter((e) => !e.approved_at).length}건
        </span>
      </div>

      <div
        style={{
          background: colors.white,
          borderRadius: radius.md,
          boxShadow: shadow.sm,
          overflow: "hidden",
        }}
      >
        {/* 테이블 헤더 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 180px",
            padding: `${spacing.md}px ${spacing.lg}px`,
            background: colors.gray[100],
            fontSize: typography.sizes.xs,
            color: colors.gray[600],
            fontWeight: typography.weights.medium,
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}
        >
          <span>사업체명</span>
          <span>담당자</span>
          <span>업종</span>
          <span>상태</span>
          <span>액션</span>
        </div>

        {/* 테이블 바디 */}
        {STUB_EMPLOYERS.map((employer, idx) => (
          <div
            key={employer.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 180px",
              padding: `${spacing.lg}px ${spacing.lg}px`,
              alignItems: "center",
              borderBottom:
                idx < STUB_EMPLOYERS.length - 1
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
                {employer.biz_name}
              </div>
              {employer.pending_reason && (
                <div
                  style={{
                    fontSize: typography.sizes.xs,
                    color: colors.warning,
                    marginTop: spacing.xs,
                  }}
                >
                  {employer.pending_reason}
                </div>
              )}
            </div>
            <div style={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>
              {employer.contact_name}
            </div>
            <div style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
              {employer.biz_type ?? "—"}
            </div>
            <div>
              <StatusBadge
                approved={!!employer.approved_at}
                suspended={!!employer.suspended_at}
              />
            </div>
            <div style={{ display: "flex", gap: spacing.sm }}>
              {/* 승인/반려 버튼 — Server Action 연결 예정 */}
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
                aria-label={`${employer.biz_name} 승인`}
              >
                승인
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
                aria-label={`${employer.biz_name} 반려`}
              >
                반려
              </button>
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
        실 데이터: employers WHERE approved_at IS NULL 연결 예정.
        승인·반려 시 operator_actions (employer_approve/employer_reject) 기록.
        반려 사유 입력은 Server Action modal로 구현 예정.
      </p>
    </section>
  );
}
