"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";
import { colors, spacing, typography, radius, shadow } from "@ilgam/design-tokens";

interface Props {
  nextUrl: string;
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "올바른 이메일 주소를 입력해주세요.",
  not_admin: "등록된 운영자 계정이 아닙니다. 관리자에게 초대를 요청하세요.",
  send_failed: "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
  callback_failed: "로그인 링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요.",
  forbidden: "운영자 권한이 없습니다.",
};

export default function LoginForm({ nextUrl, errorCode }: Props) {
  const [, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      await sendMagicLink(formData);
    },
    null
  );

  return (
    <form action={formAction} style={{ width: "100%" }}>
      <input type="hidden" name="next" value={nextUrl} />

      {errorCode && (
        <div
          style={{
            background: "#FFF3CD",
            border: "1px solid #F0AD4E",
            borderRadius: radius.sm,
            padding: spacing.md,
            marginBottom: spacing.lg,
            fontSize: typography.sizes.sm,
            color: "#856404",
          }}
          role="alert"
        >
          {ERROR_MESSAGES[errorCode] ?? "오류가 발생했습니다."}
        </div>
      )}

      <div style={{ marginBottom: spacing.lg }}>
        <label
          htmlFor="email-input"
          style={{
            display: "block",
            fontSize: typography.sizes.sm,
            color: colors.gray[700],
            marginBottom: spacing.sm,
            fontWeight: typography.weights.medium,
          }}
        >
          운영자 이메일
        </label>
        <input
          id="email-input"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@ilgam.kr"
          style={{
            width: "100%",
            padding: `${spacing.md}px ${spacing.lg}px`,
            border: `1px solid ${colors.gray[300]}`,
            borderRadius: radius.md,
            fontSize: typography.sizes.base,
            color: colors.gray[900],
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          width: "100%",
          padding: `${spacing.md}px`,
          background: isPending ? colors.gray[400] : colors.navy[700],
          color: colors.white,
          border: "none",
          borderRadius: radius.md,
          fontSize: typography.sizes.base,
          fontWeight: typography.weights.bold,
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          minHeight: 48,
        }}
      >
        {isPending ? "발송 중…" : "Magic Link 이메일 발송"}
      </button>

      <p
        style={{
          marginTop: spacing.lg,
          fontSize: typography.sizes.xs,
          color: colors.gray[500],
          textAlign: "center" as const,
          lineHeight: 1.6,
        }}
      >
        이메일로 로그인 링크가 발송됩니다. 비밀번호가 필요하지 않습니다.
        <br />
        운영자 계정 초대는 Super Admin에게 요청하세요.
      </p>
    </form>
  );
}
