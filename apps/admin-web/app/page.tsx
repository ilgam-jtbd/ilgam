import { colors, spacing, typography } from "@ilgam/design-tokens";

export default function MarketingHome() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: spacing.xxxl,
        color: colors.gray[900],
        fontSize: typography.sizes.base,
        lineHeight: typography.lineHeight,
      }}
    >
      <header style={{ marginBottom: spacing.xxxl }}>
        <h1
          style={{
            fontSize: typography.sizes.xxl,
            color: colors.navy[700],
            margin: 0,
          }}
        >
          일감
        </h1>
        <p style={{ color: colors.gray[600], marginTop: spacing.sm }}>
          한국형 시니어 스팟워크 플랫폼
        </p>
      </header>

      <section style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          베이비부머 2차 세대와 AI 청년 세대의 융합
        </h2>
        <p style={{ color: colors.gray[700] }}>
          954만 명의 시니어가 유연하게 일하고, 기업은 검증된 워커 풀을
          즉시 활용합니다. 공공 파트너십과 동네 거점으로 디지털 격차를 해소합니다.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          구인자 로그인
        </h2>
        <p style={{ color: colors.gray[700] }}>
          공고 등록과 지원 현황 확인은 대시보드에서 가능합니다.
        </p>
      </section>
    </main>
  );
}
