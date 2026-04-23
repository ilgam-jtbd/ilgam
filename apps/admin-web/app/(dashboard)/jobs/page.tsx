// RSC · 서버에서 Supabase 호출 (ADR-003)
// 실제 구현 시 createServerClient(@supabase/ssr) 사용.

import { colors, spacing, typography } from "@ilgam/design-tokens";

export default async function JobsPage() {
  return (
    <section>
      <h1 style={{ fontSize: typography.sizes.xl, color: colors.navy[800] }}>
        공고 목록
      </h1>
      <p style={{ color: colors.gray[700], marginTop: spacing.md }}>
        [스켈레톤] Supabase `select from jobs where employer_id in (...)` 연결 예정.
      </p>
    </section>
  );
}
