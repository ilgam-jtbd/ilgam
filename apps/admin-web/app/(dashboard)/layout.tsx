import type { ReactNode } from "react";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

const navLink: React.CSSProperties = {
  color: colors.white,
  textDecoration: "none",
  padding: `${spacing.sm}px ${spacing.md}px`,
  borderRadius: 6,
  fontSize: typography.sizes.sm,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  minHeight: 44,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.gray[50] }}>
      <nav
        style={{
          padding: `${spacing.md}px ${spacing.lg}px`,
          background: colors.navy[800],
          color: colors.white,
          display: "flex",
          alignItems: "center",
          gap: spacing.lg,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: typography.sizes.lg,
            fontWeight: 700,
            color: colors.white,
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          일감 어드민
        </Link>
        <div style={{ display: "flex", gap: spacing.xs, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={navLink}>
            대시보드
          </Link>
          <Link href="/jobs" style={navLink}>
            공고
          </Link>
          <Link href="/jobs/new" style={navLink}>
            새 공고
          </Link>
        </div>
      </nav>
      <div style={{ padding: spacing.lg, maxWidth: 1200, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
