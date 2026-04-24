"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

type CookieTuple = { name: string; value: string; options?: CookieOptions };

export async function sendMagicLink(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim();
  const next = (formData.get("next") as string | null) ?? "/internal";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/auth/login?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    `https://${headersList.get("host")}`;

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

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: false, // 미등록 이메일 차단 (관리자는 별도 초대)
    },
  });

  if (error) {
    // shouldCreateUser=false 이고 미등록 이메일이면 error.status 400
    const code = error.status === 400 ? "not_admin" : "send_failed";
    redirect(`/auth/login?error=${code}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/auth/login?sent=1&email=${encodeURIComponent(email)}`);
}
