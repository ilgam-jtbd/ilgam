// StatusBadge — approved/suspended/pending 3-상태 표시 (employer 등 공용).

import { colors, spacing, typography, radius } from "@ilgam/design-tokens";

export function StatusBadge({
  approved,
  suspended,
}: {
  approved: boolean;
  suspended: boolean;
}) {
  const label = suspended ? "차단" : approved ? "승인됨" : "대기";
  const bg = suspended ? colors.danger : approved ? colors.success : colors.warning;
  return (
    <span
      style={{
        fontSize: typography.sizes.xs,
        color: colors.white,
        background: bg,
        padding: `2px ${spacing.sm}px`,
        borderRadius: radius.full,
        fontWeight: typography.weights.medium,
      }}
    >
      {label}
    </span>
  );
}
