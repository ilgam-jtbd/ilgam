// Supabase 클라이언트 — Expo + SecureStore 세션 저장 (ADR-004 + 006)
// SecureStore 사용으로 OS Keychain/Keystore 에 토큰 저장.
// EXPO_PUBLIC_* 만 클라이언트 번들 노출 가능 (Expo SDK 51 규칙).

// RN 0.74+ 의 globalThis.URL 사용 (polyfill 불필요).
// 이전 RN 으로 다운그레이드 시 react-native-url-polyfill/auto 추가 필요.
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// SecureStore 는 2KB 제한이 있어 큰 토큰은 청크 분할이 필요하지만
// Supabase JWT(~700B) + refresh(~30B) 는 단일 키로 충분.
const SecureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        storage: SecureStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: { headers: { "x-app": "ilgam-worker" } },
    })
  : null;
