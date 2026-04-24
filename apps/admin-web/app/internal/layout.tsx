// RSC Layout — /internal/* 공통 보안 레이어
// ADR-009: is_platform_admin() + MFA 체크 수행.
// middleware.ts는 세션 존재 여부만 확인; 실제 admin 권한·MFA는 여기서 처리.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "@ilgam/design-tokens";
import type { PlatformAdmin } from "@ilgam/core";

export const dynamic = "force-dynamic";

async function getAdminSession(): Promise<PlatformAdmin | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Component에서는 쿠키 쓰기 불가; middleware가 담당
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("platform_admins")
    .select("profile_id, active, role, mfa_enrolled, last_mfa_at, allowed_ip_cidrs, created_at")
    .eq("profile_id", user.id)
    .eq("active", true)
    .single();

  return data as PlatformAdmin | null;
}

export default async function InternalLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/auth/forbidden");
  }

  // MFA 미등록 → setup 강제
  if (!admin.mfa_enrolled) {
    redirect("/internal/mfa-setup");
  }

  // MFA 4시간 초과 → 재인증 요구
  if (admin.last_mfa_at) {
    const mfaAge = Date.now() - new Date(admin.last_mfa_at).getTime();
    if (mfaAge > 4 * 60 * 60 * 1000) {
      redirect("/internal/mfa-reauth");
    }
  }

  const navItems = [
    { href: "/internal", label: "대시보드" },
    { href: "/internal/employers", label: "구인자 승인" },
    { href: "/internal/reports", label: "신고 처리" },
    { href: "/internal/payments", label: "결제 분쟁" },
    { href: "/internal/workers", label: "워커 관리" },
    ...(admin.role === "super_admin"
      ? [{ href: "/internal/audit", label: "감사 로그" }]
      : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.gray[50], display: "flex" }}>
      {/* 사이드바 */}
      <aside
        style={{
          width: 220,
          background: colors.navy[900],
          color: colors.white,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: `${spacing.xl}px ${spacing.lg}px`,
            borderBottom: `1px solid ${colors.navy[700]}`,
          }}
        >
          <div style={{ fontSize: typography.sizes.sm, color: colors.navy[200] }}>
            일감 운영자 백오피스
          </div>
          <div
            style={{
              fontSize: typography.sizes.xs,
              color: colors.navy[300],
              marginTop: spacing.xs,
            }}
          >
            {admin.role === "super_admin" ? "Super Admin" : "Operator"}
          </div>
        </div>
        <nav style={{ padding: `${spacing.md}px 0`, flex: 1 }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: `${spacing.md}px ${spacing.lg}px`,
                color: colors.navy[100],
                textDecoration: "none",
                fontSize: typography.sizes.sm,
                lineHeight: typography.lineHeight,
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div
          style={{
            padding: `${spacing.md}px ${spacing.lg}px`,
            borderTop: `1px solid ${colors.navy[700]}`,
            fontSize: typography.sizes.xs,
            color: colors.navy[400],
          }}
        >
          ADR-009 · 감사 추적 활성
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, padding: spacing.xl, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
