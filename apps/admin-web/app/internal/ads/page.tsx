// /internal/ads — ADR-011 dormant placeholder.
// M18 활성화 트리거: MAU >= 50K + MAVJ >= 5K + NPS >= +30
// 활성화 시 광고 슬롯 관리 UI 추가 (top_banner / b2b_premium / data_insights / category_premium).

import { colors, spacing, typography, radius } from "@ilgam/design-tokens";
import { isAdSystemActive } from "@ilgam/core";

export const dynamic = "force-static";

export default function AdsPage() {
  const active = isAdSystemActive();
  return (
    <section style={{ maxWidth: 720 }}>
      <h1
        style={{
          fontSize: typography.sizes.xl,
          color: colors.navy[900],
          margin: 0,
          fontWeight: typography.weights.bold,
        }}
      >
        광고 플랫폼 (M18+)
      </h1>
      <p style={{ color: colors.gray[600], marginTop: spacing.sm, fontSize: typography.sizes.sm }}>
        ADR-011 — 활성 상태:{" "}
        <strong style={{ color: active ? colors.success : colors.warning }}>
          {active ? "ACTIVE" : "DORMANT (대기 중)"}
        </strong>
      </p>

      <div
        style={{
          marginTop: spacing.xl,
          padding: spacing.xl,
          background: colors.gray[50],
          borderRadius: radius.md,
          border: `1px dashed ${colors.gray[300]}`,
        }}
      >
        <h2 style={{ fontSize: typography.sizes.md, color: colors.navy[800], margin: 0 }}>
          활성화 트리거 (3 AND)
        </h2>
        <ul
          style={{
            marginTop: spacing.sm,
            color: colors.gray[700],
            fontSize: typography.sizes.sm,
            lineHeight: 1.8,
          }}
        >
          <li>MAU ≥ 50,000</li>
          <li>월 검증 공고 (MAVJ) ≥ 5,000</li>
          <li>NPS ≥ +30</li>
        </ul>
        <p
          style={{ marginTop: spacing.md, fontSize: typography.sizes.xs, color: colors.gray[500] }}
        >
          활성화 시 광고 슬롯 (top_banner · b2b_premium · data_insights · category_premium) 관리 UI
          추가. 상세는 docs/decisions/ADR-011-ad-platform-architecture.md
        </p>
      </div>
    </section>
  );
}
