// FlashBanner — Server Action redirect 결과를 페이지 상단에 표시하는 RSC 컴포넌트.
// 패턴: ?ok=approved | ?error=invalid_input | ?warn=감사기록실패
// 사용 예: <FlashBanner search={search} />

import { spacing, typography, radius } from "@ilgam/design-tokens";

export type FlashSearch = { ok?: string; error?: string; warn?: string };

const STYLES = {
  ok: { bg: "#D4EDDA", border: "#28A745", text: "#155724" },
  warn: { bg: "#FFF3CD", border: "#F0AD4E", text: "#856404" },
  error: { bg: "#F8D7DA", border: "#DC3545", text: "#721C24" },
} as const;

const OK_MESSAGE: Record<string, string> = {
  approved: "승인 처리되었습니다.",
  rejected: "반려 처리되었습니다.",
};

export function FlashBanner({ search }: { search: FlashSearch }) {
  let kind: keyof typeof STYLES | null = null;
  let message = "";

  if (search.ok) {
    kind = "ok";
    message = OK_MESSAGE[search.ok] ?? "처리 완료되었습니다.";
  } else if (search.warn) {
    kind = "warn";
    message = search.warn;
  } else if (search.error) {
    kind = "error";
    message = search.error === "invalid_input"
      ? "입력값이 올바르지 않습니다."
      : search.error === "missing_reason"
        ? "사유를 입력해 주세요."
        : `오류: ${search.error}`;
  }
  if (!kind) return null;

  const style = STYLES[kind];
  return (
    <div
      role={kind === "ok" ? "status" : "alert"}
      style={{
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: radius.sm,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: typography.sizes.sm,
      }}
    >
      {message}
    </div>
  );
}
