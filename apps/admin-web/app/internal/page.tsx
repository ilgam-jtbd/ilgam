// RSC · /internal 홈 — NSM 대시보드 (ADR-002, ADR-009)
// 실 Supabase 쿼리는 platform_fees_daily MV + matches 집계로 연결 예정.

import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

interface NsmCard {
  label: string;
  value: string;
  unit: string;
  description: string;
  trend?: string;
}

const PLACEHOLDER_CARDS: NsmCard[] = [
  {
    label: "월 완료 매칭",
    value: "—",
    unit: "건",
    description: "NSM · shifts.completed + payments.paid 기준",
    trend: "목표: M3 1,500건",
  },
  {
    label: "D7 리텐션",
    value: "—",
    unit: "%",
    description: "첫 지원 후 7일 내 두 번째 지원 워커 비율",
    trend: "목표: 30%",
  },
  {
    label: "GMV (월)",
    value: "—",
    unit: "만원",
    description: "gross_amount_krw 합산 · 수수료 별도",
    trend: "BEP: 3,000만원",
  },
];

function NsmCardComponent({ card }: { card: NsmCard }) {
  return (
    <div
      style={{
        background: colors.white,
        borderRadius: radius.md,
        boxShadow: shadow.md,
        padding: spacing.xl,
        display: "flex",
        flexDirection: "column",
        gap: spacing.sm,
        minWidth: 200,
        flex: 1,
      }}
    >
      <div style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
        {card.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: spacing.xs }}>
        <span
          style={{
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.bold,
            color: colors.navy[800],
          }}
        >
          {card.value}
        </span>
        <span style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
          {card.unit}
        </span>
      </div>
      <div style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
        {card.description}
      </div>
      {card.trend && (
        <div
          style={{
            fontSize: typography.sizes.xs,
            color: colors.navy[600],
            fontWeight: typography.weights.medium,
          }}
        >
          {card.trend}
        </div>
      )}
    </div>
  );
}

export default function InternalHomePage() {
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
        운영 대시보드
      </h1>

      {/* NSM 카드 3개 */}
      <div
        style={{
          display: "flex",
          gap: spacing.lg,
          marginBottom: spacing.xxxl,
          flexWrap: "wrap",
        }}
      >
        {PLACEHOLDER_CARDS.map((card) => (
          <NsmCardComponent key={card.label} card={card} />
        ))}
      </div>

      {/* 빠른 접근 */}
      <div
        style={{
          background: colors.white,
          borderRadius: radius.md,
          boxShadow: shadow.sm,
          padding: spacing.xl,
        }}
      >
        <h2
          style={{
            fontSize: typography.sizes.lg,
            color: colors.navy[800],
            margin: 0,
            marginBottom: spacing.lg,
            fontWeight: typography.weights.medium,
          }}
        >
          빠른 접근
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
          {[
            { href: "/internal/employers", label: "구인자 승인 대기", badge: "승인 큐" },
            { href: "/internal/reports", label: "신고 티켓 처리", badge: "3트랙" },
            { href: "/internal/payments", label: "결제 분쟁 현황", badge: "분쟁" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${spacing.md}px ${spacing.lg}px`,
                background: colors.gray[50],
                borderRadius: radius.sm,
                textDecoration: "none",
                color: colors.navy[700],
                fontSize: typography.sizes.base,
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.gray[500],
                  background: colors.gray[200],
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  borderRadius: radius.full,
                }}
              >
                {item.badge}
              </span>
            </a>
          ))}
        </div>
      </div>

      <p
        style={{
          marginTop: spacing.xl,
          fontSize: typography.sizes.xs,
          color: colors.gray[400],
        }}
      >
        실 데이터: platform_fees_daily MV + matches 집계 쿼리 연결 예정 (E-4 완료 후).
        모든 조회는 operator_actions에 internal_page_view로 기록됩니다.
      </p>
    </section>
  );
}
