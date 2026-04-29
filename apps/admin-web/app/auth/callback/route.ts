// /auth/callback — Magic Link OTP 교환
// Supabase가 이메일 링크에 ?code= 파라미터를 붙여 여기로 리디렉트함.
// exchangeCodeForSession으로 세션 쿠키 설정 후 /internal로 이동.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/internal";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieTuple[]) {
          cookiesToSet.forEach(({ name, value, options }: CookieTuple) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
  }

  // next 파라미터가 /internal/* 인지 확인 (오픈 리디렉트 방어)
  const safeNext = next.startsWith("/") ? next : "/internal";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
