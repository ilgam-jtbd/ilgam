// RSC · audit_log + operator_actions 통합 검색 (ADR-009 스크린 6)
// super_admin 전용 스크린 — layout.tsx에서 role 체크 후 접근 허용
// 개인정보보호법 제29조 안전성 조치 감사 대응

import type { OperatorAction } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

const STUB_ACTIONS: OperatorAction[] = [
  {
    id: 1,
    actor_id: "admin-001",
    action_type: "employer_approve",
    target_table: "employers",
    target_id: "emp-001",
    reason: "사업자등록증 확인 완료",
    metadata: { biz_name: "(주)한빛물류" },
    source_ip: "203.0.113.10",
    created_at: "2026-04-24T10:00:00Z",
  },
  {
    id: 2,
    actor_id: "admin-002",
    action_type: "worker_ban",
    target_table: "workers",
    target_id: "w-0001",
    reason: "노쇼 3회 누적 자동 경고 후 수동 ban",
    metadata: { ban_days: 30 },
    source_ip: "203.0.113.22",
    created_at: "2026-04-24T09:30:00Z",
  },
  {
    id: 3,
    actor_id: "admin-001",
    action_type: "report_shadow_hide",
    target_table: "jobs",
    target_id: "job-005",
    reason: "동일 사업자번호 중복 신고 2건 확인",
    metadata: { ticket_id: "t-0002" },
    source_ip: "203.0.113.10",
    created_at: "2026-04-24T08:45:00Z",
  },
];

const ACTION_LABEL: Record<string, string> = {
  employer_approve: "구인자 승인",
  employer_reject: "구인자 반려",
  employer_suspend: "구인자 차단",
  report_resolve: "신고 종결",
  report_shadow_hide: "공고 숨김",
  report_block_employer: "구인자 게시 차단",
  payment_refund_partial: "부분 환불",
  payment_refund_full: "전액 환불",
  payment_escrow_hold: "에스크로 정지",
  worker_ban: "워커 정지",
  worker_unban: "워커 해제",
  audit_search: "감사 검색",
  internal_page_view: "페이지 조회",
  admin_invite: "관리자 초대",
  admin_revoke: "관리자 회수",
  admin_mfa_reset: "MFA 초기화",
};

export default function AuditPage() {
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
        감사 로그 검색
      </h1>

      <div
        style={{
          background: colors.navy[900] + "15",
          border: `1px solid ${colors.navy[700]}`,
          borderRadius: radius.sm,
          padding: spacing.md,
          marginBottom: spacing.xl,
          fontSize: typography.sizes.sm,
          color: colors.navy[800],
        }}
      >
        Super Admin 전용 화면. 모든 검색 행위는 operator_actions (audit_search) 에 자동 기록됩니다.
        개인정보보호법 제29조 안전성 조치 — 감사 추적 3년 보존.
      </div>

      {/* 검색 폼 (실 구현 시 Server Action + searchParams 연결) */}
      <form
        style={{
          background: colors.white,
          borderRadius: radius.md,
          boxShadow: shadow.sm,
          padding: spacing.xl,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <div>
            <label
              htmlFor="actor-input"
              style={{
                display: "block",
                fontSize: typography.sizes.xs,
                color: colors.gray[600],
                marginBottom: spacing.xs,
              }}
            >
              액터 (관리자 ID)
            </label>
            <input
              id="actor-input"
              type="text"
              placeholder="admin-001"
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: radius.sm,
                fontSize: typography.sizes.sm,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="target-table-input"
              style={{
                display: "block",
                fontSize: typography.sizes.xs,
                color: colors.gray[600],
                marginBottom: spacing.xs,
              }}
            >
              대상 테이블
            </label>
            <select
              id="target-table-input"
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: radius.sm,
                fontSize: typography.sizes.sm,
                background: colors.white,
                boxSizing: "border-box",
              }}
            >
              <option value="">전체</option>
              <option value="employers">employers</option>
              <option value="workers">workers</option>
              <option value="jobs">jobs</option>
              <option value="payments">payments</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="date-from-input"
              style={{
                display: "block",
                fontSize: typography.sizes.xs,
                color: colors.gray[600],
                marginBottom: spacing.xs,
              }}
            >
              시작일
            </label>
            <input
              id="date-from-input"
              type="date"
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: radius.sm,
                fontSize: typography.sizes.sm,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="date-to-input"
              style={{
                display: "block",
                fontSize: typography.sizes.xs,
                color: colors.gray[600],
                marginBottom: spacing.xs,
              }}
            >
              종료일
            </label>
            <input
              id="date-to-input"
              type="date"
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: radius.sm,
                fontSize: typography.sizes.sm,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{
            padding: `${spacing.sm}px ${spacing.xl}px`,
            background: colors.navy[700],
            color: colors.white,
            border: "none",
            borderRadius: radius.sm,
            fontSize: typography.sizes.sm,
            cursor: "pointer",
            fontWeight: typography.weights.medium,
          }}
        >
          검색
        </button>
      </form>

      {/* 결과 테이블 */}
      <div
        style={{
          background: colors.white,
          borderRadius: radius.md,
          boxShadow: shadow.sm,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 1fr 1fr 1fr 120px",
            padding: `${spacing.md}px ${spacing.lg}px`,
            background: colors.gray[100],
            fontSize: typography.sizes.xs,
            color: colors.gray[600],
            fontWeight: typography.weights.medium,
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}
        >
          <span>ID</span>
          <span>액션</span>
          <span>대상</span>
          <span>사유</span>
          <span>IP</span>
          <span>시각</span>
        </div>

        {STUB_ACTIONS.map((action, idx) => (
          <div
            key={action.id}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 1fr 1fr 120px",
              padding: `${spacing.md}px ${spacing.lg}px`,
              alignItems: "center",
              fontSize: typography.sizes.sm,
              borderBottom:
                idx < STUB_ACTIONS.length - 1
                  ? `1px solid ${colors.gray[100]}`
                  : "none",
            }}
          >
            <span style={{ color: colors.gray[500] }}>#{action.id}</span>
            <span style={{ color: colors.navy[700], fontWeight: typography.weights.medium }}>
              {ACTION_LABEL[action.action_type] ?? action.action_type}
            </span>
            <span style={{ color: colors.gray[700] }}>
              {action.target_table ?? "—"}
              {action.target_id && (
                <span style={{ color: colors.gray[400], fontSize: typography.sizes.xs }}>
                  {" "}({action.target_id.slice(0, 8)}...)
                </span>
              )}
            </span>
            <span
              style={{
                color: colors.gray[600],
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {action.reason ?? "—"}
            </span>
            <span style={{ color: colors.gray[500], fontSize: typography.sizes.xs }}>
              {action.source_ip ?? "—"}
            </span>
            <span style={{ color: colors.gray[500], fontSize: typography.sizes.xs }}>
              {new Date(action.created_at).toLocaleString("ko-KR", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
        실 데이터: operator_actions + audit_log 통합 JOIN 쿼리 연결 예정.
        private.* 조회는 app.log_admin_access() + SECURITY DEFINER RPC 경유 (ADR-005).
        검색 실행마다 audit_search 액션 자동 기록.
      </p>
    </section>
  );
}
