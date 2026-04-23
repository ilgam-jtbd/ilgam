import type { ReactNode } from "react";
import { colors } from "@ilgam/design-tokens";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.gray[50] }}>
      <nav
        style={{
          padding: 16,
          background: colors.navy[700],
          color: colors.white,
        }}
      >
        일감 어드민
      </nav>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
