"use client";
// /internal/mfa-reauth — MFA 4시간 세션 만료 시 재인증 (ADR-009)
// 성공 시 platform_admins.last_mfa_at 업데이트 후 /internal로 복귀.

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { colors, spacing, typography, radius, shadow } from "@ilgam/design-tokens";
import { Suspense } from "react";

function ReauthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/internal";

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleVerify() {
    if (code.length !== 6) return;
    setStatus("verifying");
    setErrorMsg(null);

    // 등록된 TOTP factor 조회 — listFactors 결과에서 첫 번째 TOTP factor 사용
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactor = factorsData?.totp?.[0];

    if (!totpFactor) {
      setStatus("error");
      setErrorMsg("등록된 MFA 수단이 없습니다. 관리자에게 문의하세요.");
      return;
    }

    const { data: challengeData, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

    if (challengeErr || !challengeData) {
      setStatus("error");
      setErrorMsg("챌린지 생성 실패. 잠시 후 다시 시도해주세요.");
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code,
    });

    if (verifyErr) {
      setStatus("idle");
      setErrorMsg("인증 코드가 올바르지 않습니다.");
      return;
    }

    // last_mfa_at 업데이트
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("platform_admins")
        .update({ last_mfa_at: new Date().toISOString() })
        .eq("profile_id", user.id);
    }

    router.replace(next.startsWith("/") ? next : "/internal");
  }

  return (
    <div style={{ marginTop: spacing.xl }}>
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
          htmlFor="reauth-code"
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
          id="reauth-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          autoFocus
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
          cursor: code.length !== 6 || status === "verifying" ? "not-allowed" : "pointer",
          minHeight: 48,
        }}
      >
        {status === "verifying" ? "확인 중…" : "재인증"}
      </button>
    </div>
  );
}

export default function MfaReauthPage() {
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
        }}
      >
        <div style={{ fontSize: 40, textAlign: "center" as const, marginBottom: spacing.lg }}>
          🔐
        </div>
        <h1
          style={{
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
            color: colors.navy[800],
            margin: 0,
            marginBottom: spacing.sm,
            textAlign: "center" as const,
          }}
        >
          이중 인증 재확인
        </h1>
        <p
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[600],
            textAlign: "center" as const,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          4시간이 지나 재인증이 필요합니다.
          <br />
          인증 앱에서 코드를 확인하세요.
        </p>

        <Suspense>
          <ReauthForm />
        </Suspense>
      </div>
    </div>
  );
}
