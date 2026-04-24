// Next.js Middleware — 세션 갱신 + /internal 기본 인증 가드
// ADR-009: is_platform_admin() + MFA 체크는 Server Component layout에서 수행.
// middleware는 Edge Runtime 제약상 DB 조회 없이 세션 존재 여부만 확인.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (Supabase SSR 권장 패턴)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // /internal/* 경로 보호
  if (pathname.startsWith("/internal")) {
    // 비로그인 → 로그인 페이지
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // 로그인 상태 → layout.tsx에서 is_platform_admin + MFA 체크
  }

  return response;
}

export const config = {
  matcher: [
    // 정적 파일 + _next 제외, /internal 포함
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
