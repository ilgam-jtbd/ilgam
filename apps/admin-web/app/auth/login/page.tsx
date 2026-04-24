// /auth/login — Magic Link 로그인 (ADR-009)
// 이력서·비밀번호 없이 이메일로 운영자 인증.
// shouldCreateUser=false 로 미등록 이메일 차단.

import LoginForm from "./login-form";
import { colors, spacing, typography, shadow, radius } from "@ilgam/design-tokens";

interface Props {
  searchParams: Promise<{
    next?: string;
    sent?: string;
    email?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextUrl = params.next ?? "/internal";

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
          boxShadow: shadow.lg,
          padding: spacing.xxxl,
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* 로고 */}
        <div style={{ textAlign: "center" as const, marginBottom: spacing.xxxl }}>
          <div
            style={{
              fontSize: typography.sizes.xxl,
              fontWeight: typography.weights.bold,
              color: colors.navy[800],
              letterSpacing: "-0.5px",
            }}
          >
            일감
          </div>
          <div
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[500],
              marginTop: spacing.xs,
            }}
          >
            운영자 백오피스
          </div>
        </div>

        {params.sent ? (
          /* 발송 완료 화면 */
          <div style={{ textAlign: "center" as const }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: spacing.lg,
              }}
            >
              📬
            </div>
            <h1
              style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.navy[800],
                margin: 0,
                marginBottom: spacing.md,
              }}
            >
              이메일을 확인하세요
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
              <strong>{params.email}</strong>로 로그인 링크가 발송되었습니다.
              <br />
              링크를 클릭하면 자동으로 로그인됩니다.
            </p>
            <p
              style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[400],
              }}
            >
              이메일이 오지 않았나요?{" "}
              <a href="/auth/login" style={{ color: colors.navy[600] }}>
                다시 시도
              </a>
            </p>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.navy[800],
                margin: 0,
                marginBottom: spacing.sm,
              }}
            >
              로그인
            </h1>
            <p
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[500],
                margin: 0,
                marginBottom: spacing.xl,
              }}
            >
              운영자 이메일로 Magic Link를 받아 로그인하세요.
            </p>

            <LoginForm nextUrl={nextUrl} errorCode={params.error} />
          </>
        )}
      </div>
    </div>
  );
}
