// /auth/forbidden — 비관리자 접근 차단 (403)

import { colors, spacing, typography, radius, shadow } from "@ilgam/design-tokens";

export default function ForbiddenPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.gray[50],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
      }}
    >
      <div
        style={{
          background: colors.white,
          borderRadius: radius.lg,
          boxShadow: shadow.md,
          padding: spacing.xxxl,
          maxWidth: 440,
          width: "100%",
          textAlign: "center" as const,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: spacing.lg }}>🔒</div>
        <h1
          style={{
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
            color: colors.navy[800],
            margin: 0,
            marginBottom: spacing.md,
          }}
        >
          접근 권한 없음
        </h1>
        <p
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            lineHeight: 1.6,
            margin: 0,
            marginBottom: spacing.xl,
          }}
        >
          이 페이지는 일감 운영자만 접근할 수 있습니다.
          <br />
          운영자 계정이 필요하면 Super Admin에게 문의하세요.
        </p>
        <a
          href="/auth/login"
          style={{
            display: "inline-block",
            padding: `${spacing.md}px ${spacing.xl}px`,
            background: colors.navy[700],
            color: colors.white,
            borderRadius: radius.md,
            textDecoration: "none",
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
          }}
        >
          로그인 페이지로
        </a>
      </div>
    </div>
  );
}
