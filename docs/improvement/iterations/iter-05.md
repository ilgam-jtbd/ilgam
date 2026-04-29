# iter 05 — Demo Mode 토글 (Vercel preview)

**시각**: 2026-04-27 16:45–17:05 KST · **에이전트**: 직접 적용 (PM iter01 권고)

## 변경

| 파일 | 변경 |
|---|---|
| `apps/admin-web/lib/demo.ts` | 신규 — `isDemoMode` (NEXT_PUBLIC_DEMO_MODE=1) + 3종 fixture (DEMO_PENDING_EMPLOYERS, DEMO_DASHBOARD_STATS, DEMO_EMPLOYER_OPTIONS) |
| `app/internal/employers/page.tsx` | `loadPending()` 진입 시 demo 분기 |
| `app/(dashboard)/dashboard/page.tsx` | `loadStats()` 진입 시 demo 분기 + inline createServerClient 제거 → factory |
| `app/(dashboard)/jobs/new/page.tsx` | `listEmployers()` 진입 시 demo 분기 |
| `.env.example` | `NEXT_PUBLIC_DEMO_MODE=0` + `EXPO_PUBLIC_ALLOW_MOCK=false` 명시 + 안전 경고 |

## 1인 운영 효과

- **자격증명 도착 전**: Vercel preview에 `NEXT_PUBLIC_DEMO_MODE=1` 환경 변수만 설정하면 admin 화면 4종(employers, dashboard, jobs/new, marketing)이 정상 동작
- KORDI MOU 미팅·투자자 데모·CPO 스크린샷 검증에 즉시 사용 가능
- prod 환경에서는 `=0`으로 가둠 → 데이터 누수 0

## 보안

- demo는 RSC SELECT만 단락. Server Actions(`approveEmployer/rejectEmployer`)는 그대로 `requirePlatformAdmin()` 가드 통과 시도 → demo 모드에서 액션 시도하면 admin 인증 실패 → /auth/forbidden (의도)
- 실 데이터 누수 표면 없음

## 검증

- typecheck + lint: green
- 수동: NEXT_PUBLIC_DEMO_MODE=1로 dev 서버 띄우면 인증 우회 없이 demo fixture 표시됨

## 미적용 (이월)

- worker-app demo 모드는 이미 `isMockAllowed`로 처리 (iter01) — 동일 패턴 통합 안내 README → iter 09
- /internal/reports, /internal/payments 등 stub 페이지는 이미 stub 데이터 — demo 토글 불필요
