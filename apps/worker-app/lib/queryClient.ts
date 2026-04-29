// TanStack Query 클라이언트 — 기본 폴링/스테일 정책 (ADR-003)
// · 워커 앱은 폴링 + 푸시; Realtime 은 매칭 확정 화면에서만 (배터리/LTE 고려)
// · staleTime 30s: 시니어 UX 에서 잦은 리프레시 시각 노이즈 최소화

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: 1 },
  },
});
