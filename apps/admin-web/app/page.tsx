import Image from "next/image";
import Link from "next/link";
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
      <header
        style={{
          marginBottom: spacing.xxxl,
          display: "flex",
          alignItems: "center",
          gap: spacing.lg,
        }}
      >
        <Image
          src="/logo.png"
          alt="일감 로고"
          width={80}
          height={80}
          priority
          style={{ borderRadius: 16 }}
        />
        <div>
          <h1
            style={{
              fontSize: typography.sizes.xxl,
              color: colors.navy[700],
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            일감
          </h1>
          <p style={{ color: colors.gray[600], marginTop: spacing.xs, margin: 0 }}>
            한국형 시니어 스팟워크 플랫폼
          </p>
        </div>
      </header>

      <section style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          베이비부머 2차 세대와 AI 청년 세대의 융합
        </h2>
        <p style={{ color: colors.gray[700] }}>
          954만 명의 시니어가 유연하게 일하고, 기업은 검증된 워커 풀을 즉시 활용합니다. 공공
          파트너십과 동네 거점으로 디지털 격차를 해소합니다.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: spacing.xl,
          marginBottom: spacing.xxxl,
        }}
      >
        <div
          style={{
            padding: spacing.xl,
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
          }}
        >
          <h3 style={{ fontSize: typography.sizes.md, color: colors.navy[800], marginTop: 0 }}>
            구인자
          </h3>
          <p style={{ color: colors.gray[700] }}>
            공고 등록 · 매칭 확인 · 정산까지 대시보드에서 한번에.
          </p>
          <Link
            href="/auth/login"
            style={{
              display: "inline-block",
              marginTop: spacing.md,
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: colors.navy[700],
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            구인자 로그인 →
          </Link>
        </div>

        <div
          style={{
            padding: spacing.xl,
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
          }}
        >
          <h3 style={{ fontSize: typography.sizes.md, color: colors.navy[800], marginTop: 0 }}>
            근로자
          </h3>
          <p style={{ color: colors.gray[700] }}>
            모바일 앱으로 주변 일감을 찾고 바로 지원하세요. 정산도 당일.
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: spacing.md,
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: colors.gray[100],
              color: colors.gray[700],
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            앱 출시 예정
          </span>
        </div>
      </section>

      <footer style={{ color: colors.gray[500], fontSize: typography.sizes.sm }}>
        © 2026 ILGAM · 통신판매중개업
      </footer>
    </main>
  );
}
