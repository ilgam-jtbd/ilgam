import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/jobs",       label: "공고 관리" },
  { href: "/applicants", label: "지원자" },
  { href: "/employers",  label: "구인자 심사" },
  { href: "/shifts",     label: "근무 현황" },
  { href: "/payments",   label: "정산" },
  { href: "/matching",   label: "매칭 운영" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f0" }}>
      <nav
        style={{
          background: "#0d1b2a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 2.5rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          height: "56px",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.2rem",
            color: "#c9a84c",
            letterSpacing: "0.02em",
          }}
        >
          VELOR
        </span>
        <span
          style={{
            width: "1px",
            height: "16px",
            background: "rgba(255,255,255,0.15)",
          }}
        />
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "color 0.15s",
            }}
          >
            {item.label}
          </a>
        ))}
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.62rem",
            color: "#2dd4bf",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ADMIN
        </span>
      </nav>
      <div style={{ padding: "2.5rem 3rem" }}>{children}</div>
    </div>
  );
}
