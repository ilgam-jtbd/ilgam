"use client";
// /internal/mfa-setup — TOTP MFA 최초 등록 (ADR-009)
// Supabase Auth MFA + platform_admins.mfa_enrolled = true 동기화.

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { colors, spacing, typography, radius, shadow } from "@ilgam/design-tokens";

export default function MfaSetupPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function enroll() {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "ILGAM Admin",
      });
      if (error || !data) {
        setStatus("error");
        setErrorMsg("MFA 등록 초기화에 실패했습니다. 페이지를 새로고침해주세요.");
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStatus("ready");
    }
    enroll();
  }, []);

  async function handleVerify() {
    if (!factorId || code.length !== 6) return;
    setStatus("verifying");
    setErrorMsg(null);

    const { data: challengeData, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr || !challengeData) {
      setStatus("error");
      setErrorMsg("챌린지 생성 실패. 다시 시도해주세요.");
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyErr) {
      setStatus("ready");
      setErrorMsg("인증 코드가 올바르지 않습니다. 앱에서 최신 코드를 확인하세요.");
      return;
    }

    // platform_admins.mfa_enrolled + last_mfa_at 업데이트
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("platform_admins")
        .update({ mfa_enrolled: true, last_mfa_at: new Date().toISOString() })
        .eq("profile_id", user.id);
    }

    router.replace("/internal");
  }

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
          maxWidth: 480,
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
            color: colors.navy[800],
            margin: 0,
            marginBottom: spacing.sm,
          }}
        >
          이중 인증(MFA) 설정
        </h1>
        <p
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[600],
            margin: 0,
            marginBottom: spacing.xl,
            lineHeight: 1.6,
          }}
        >
          Google Authenticator 또는 동일한 TOTP 앱으로 아래 QR 코드를 스캔하세요.
          설정 후 표시된 6자리 코드를 입력하면 활성화됩니다.
        </p>

        {status === "loading" && (
          <p style={{ color: colors.gray[500], textAlign: "center" as const }}>
            초기화 중…
          </p>
        )}

        {(status === "ready" || status === "verifying" || status === "error") && qrCode && (
          <>
            {/* QR 코드 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: spacing.lg,
              }}
            >
              <img
                src={qrCode}
                alt="MFA QR 코드"
                width={200}
                height={200}
                style={{ border: `1px solid ${colors.gray[200]}`, borderRadius: radius.sm }}
              />
            </div>

            {/* 수동 입력용 시크릿 */}
            {secret && (
              <div
                style={{
                  background: colors.gray[50],
                  borderRadius: radius.sm,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  fontFamily: "monospace",
                  fontSize: typography.sizes.sm,
                  color: colors.gray[700],
                  textAlign: "center" as const,
                  letterSpacing: "0.1em",
                  wordBreak: "break-all",
                }}
              >
                {secret}
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: "#FDECEA",
                  border: `1px solid ${colors.danger}`,
                  borderRadius: radius.sm,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  fontSize: typography.sizes.sm,
                  color: colors.danger,
                }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: spacing.lg }}>
              <label
                htmlFor="totp-input"
                style={{
                  display: "block",
                  fontSize: typography.sizes.sm,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                  fontWeight: typography.weights.medium,
                }}
              >
                인증 앱의 6자리 코드
              </label>
              <input
                id="totp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                style={{
                  width: "100%",
                  padding: `${spacing.md}px`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: radius.md,
                  fontSize: 24,
                  textAlign: "center" as const,
                  letterSpacing: "0.4em",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={code.length !== 6 || status === "verifying"}
              style={{
                width: "100%",
                padding: `${spacing.md}px`,
                background:
                  code.length !== 6 || status === "verifying"
                    ? colors.gray[300]
                    : colors.navy[700],
                color: colors.white,
                border: "none",
                borderRadius: radius.md,
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.bold,
                cursor:
                  code.length !== 6 || status === "verifying"
                    ? "not-allowed"
                    : "pointer",
                minHeight: 48,
              }}
            >
              {status === "verifying" ? "확인 중…" : "MFA 활성화"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
