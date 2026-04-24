// RSC · 결제 분쟁 수동 개입 (ADR-009 스크린 3, ADR-004 연계)
// 환불 트리거 · 재송금 재시도 · 에스크로 정지
// operator 역할은 부분 환불까지 / super_admin만 전액 환불·에스크로 정지 가능 (ADR-009 매트릭스)

import type { Payment } from "@ilgam/core";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

type DisputePayment = Payment & {
  job_title: string;
  worker_name: string;
  dispute_reason: string;
  dispute_raised_at: string;
};

const STUB_PAYMENTS: DisputePayment[] = [
  {
    id: "pay-0001",
    shift_id: "shift-001",
    worker_id: "worker-001",
    employer_id: "employer-001",
    gross_amount_krw: 84000,
    platform_fee_rate: 0.15,
    platform_fee_krw: 12600,
    worker_net_krw: 71400,
    status: "paid",
    expected_settle_at: "2026-04-21T00:00:00Z",
    settled_at: null,
    job_title: "강서 쿠팡 피킹 04/20",
    worker_name: "김시니어",
    dispute_reason: "출근 인증 후 조기 퇴장 강요 · 임금 삭감",
    dispute_raised_at: "2026-04-21T14:00:00Z",
  },
  {
    id: "pay-0002",
    shift_id: "shift-002",
    worker_id: "worker-002",
    employer_id: "employer-002",
    gross_amount_krw: 160000,
    platform_fee_rate: 0.15,
    platform_fee_krw: 24000,
    worker_net_krw: 136000,
    status: "pending",
    expected_settle_at: "2026-04-25T00:00:00Z",
    settled_at: null,
    job_title: "송파 베이커리 프렙 04/24",
    worker_name: "박시니어",
    dispute_reason: "에스크로 미승인 · 구인자 미응답 15분 초과",
    dispute_raised_at: "2026-04-24T11:30:00Z",
  },
];

function formatKrw(amount: number): string {
  return `${(amount / 10000).toFixed(1)}만원`;
}

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const map: Record<Payment["status"], { label: string; bg: string }> = {
    pending: { label: "대기", bg: colors.warning },
    authorized: { label: "승인됨", bg: colors.info },
    paid: { label: "지급됨", bg: colors.success },
    failed: { label: "실패", bg: colors.danger },
    refunded: { label: "환불됨", bg: colors.gray[500] },
  };
  const { label, bg } = map[status];
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

export default function PaymentsPage() {
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
        결제 분쟁 관리
      </h1>

      <div
        style={{
          background: colors.warning + "20",
          border: `1px solid ${colors.warning}`,
          borderRadius: radius.sm,
          padding: spacing.md,
          marginBottom: spacing.xl,
          fontSize: typography.sizes.sm,
          color: colors.gray[800],
        }}
      >
        전액 환불·에스크로 정지는 super_admin 전용입니다. 되돌릴 수 없는 액션 수행 전 반드시 사유를 입력하십시오.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
        {STUB_PAYMENTS.map((payment) => (
          <div
            key={payment.id}
            style={{
              background: colors.white,
              borderRadius: radius.md,
              boxShadow: shadow.md,
              padding: spacing.xl,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.lg,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <span
                    style={{
                      fontSize: typography.sizes.base,
                      color: colors.navy[800],
                      fontWeight: typography.weights.medium,
                    }}
                  >
                    {payment.job_title}
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div
                  style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs,
                  }}
                >
                  워커: {payment.worker_name} · #{payment.id}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                    color: colors.navy[800],
                  }}
                >
                  {formatKrw(payment.gross_amount_krw)}
                </div>
                <div style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
                  수수료 {formatKrw(payment.platform_fee_krw)} · 워커 수령 {formatKrw(payment.worker_net_krw)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: colors.gray[50],
                borderRadius: radius.sm,
                padding: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <div style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
                분쟁 사유
              </div>
              <div
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[800],
                  marginTop: spacing.xs,
                }}
              >
                {payment.dispute_reason}
              </div>
              <div
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.gray[400],
                  marginTop: spacing.xs,
                }}
              >
                신고: {new Date(payment.dispute_raised_at).toLocaleString("ko-KR")}
              </div>
            </div>

            <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
              {/* operator + super_admin 가능 */}
              <button
                type="button"
                style={{
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  background: colors.warning,
                  color: colors.white,
                  border: "none",
                  borderRadius: radius.sm,
                  fontSize: typography.sizes.sm,
                  cursor: "pointer",
                  fontWeight: typography.weights.medium,
                }}
                aria-label="부분 환불"
              >
                부분 환불
              </button>
              <button
                type="button"
                style={{
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  background: colors.info,
                  color: colors.white,
                  border: "none",
                  borderRadius: radius.sm,
                  fontSize: typography.sizes.sm,
                  cursor: "pointer",
                  fontWeight: typography.weights.medium,
                }}
                aria-label="재송금 재시도"
              >
                재송금 재시도
              </button>
              {/* super_admin 전용 — 실 구현 시 role 체크 후 표시 */}
              <button
                type="button"
                style={{
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  background: colors.danger,
                  color: colors.white,
                  border: "none",
                  borderRadius: radius.sm,
                  fontSize: typography.sizes.sm,
                  cursor: "pointer",
                  fontWeight: typography.weights.medium,
                }}
                aria-label="전액 환불 (super_admin 전용)"
              >
                전액 환불 (SA 전용)
              </button>
              <button
                type="button"
                style={{
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  background: colors.gray[800],
                  color: colors.white,
                  border: "none",
                  borderRadius: radius.sm,
                  fontSize: typography.sizes.sm,
                  cursor: "pointer",
                  fontWeight: typography.weights.medium,
                }}
                aria-label="에스크로 정지 (super_admin 전용)"
              >
                에스크로 정지 (SA 전용)
              </button>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: spacing.xl,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        실 데이터: payments WHERE dispute_status = 'raised' 연결 예정.
        액션 시 operator_actions (payment_refund_partial / payment_refund_full / payment_escrow_hold) 기록.
        PortOne 환불 API 호출은 Server Action 경유 (서비스 롤 키 클라이언트 노출 금지).
      </p>
    </section>
  );
}
