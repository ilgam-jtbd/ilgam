// 인증 헬퍼 — KR 휴대폰 번호 + Supabase OTP (signInWithOtp + verifyOtp)
// ADR-006: 토큰은 SecureStore (lib/supabase.ts) 에 저장
// SMS provider 미연동 환경: signInWithOtp 가 에러를 던지면 호출부에서 사용자 알림.

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

// 010-1234-5678 / 01012345678 / +82 10 1234 5678 → +821012345678
export function normalizeKrPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+82")) {
    const rest = digits.slice(3).replace(/^0+/, "");
    return /^1\d{8,9}$/.test(rest) ? `+82${rest}` : null;
  }
  if (digits.startsWith("0")) {
    const rest = digits.slice(1);
    return /^1\d{8,9}$/.test(rest) ? `+82${rest}` : null;
  }
  return /^1\d{8,9}$/.test(digits) ? `+82${digits}` : null;
}

export async function sendOtp(phone: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase 가 설정되지 않았습니다. (.env.EXPO_PUBLIC_SUPABASE_URL 확인)");
  }
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOtp(phone: string, token: string): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase 가 설정되지 않았습니다.");
  }
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

// 현재 세션을 구독해 반환. Supabase 미설정 환경에서는 항상 null.
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isAuthenticated: Boolean(user) };
}
