# ADR-003 · Frontend 스택 · 시니어 UX 구현 전략

- **상태**: Accepted
- **일자**: 2026-04-23
- **참여 에이전트**: Frontend, CPO

## 스택 확정

- **Web(구인자 어드민)**: Next.js 14 App Router · React Server Components · TypeScript strict
- **Mobile(시니어 워커 앱)**: React Native + Expo SDK 51 (dev build, EAS Build/Submit/Update)
- **UI 라이브러리**: 웹 `shadcn/ui`, 모바일 `React Native Paper` — 공유 컴포넌트 없이 디자인 토큰만 공유

## 상태 관리

M1은 **TanStack Query + Zustand 경량 조합**만. 서버 상태(일감 목록·지원·프로필) = TanStack Query가 캐시·재시도·낙관적 업데이트, Zustand = 세션·필터·온보딩 스텝·outbox 큐.

**재평가 트리거(6개월)**:
- 전역 파생 상태 7개 이상
- 실시간 채팅·알림 피드 3개 화면 이상 교차
- 구인자 어드민에 복합 폼/워크플로 편집기 도입

2개 이상 충족 시 Jotai 부분 도입 검토, Redux Toolkit은 보류.

## 시니어 UX 기술 우선순위 3가지

1. **오프라인·간헐 네트워크 내성** — TanStack Query `persistQueryClient` + MMKV(RN)/IndexedDB(웹) 로컬 우선 렌더, mutation outbox 재시도
2. **미스탭 복구 레일** — 파괴적 액션(지원 취소·출근 확인)은 2초 Undo 토스트 + 서버 soft-commit → 롤백 가능. 손떨림·롱프레스 오발화 텔레메트리 축적
3. **세션·딥링크 회복력** — SMS 딥링크 진입 이탈 60~70% 구간 방어. Supabase JWT 30일 + 매직링크 알림톡 1순위/SMS 폴백. 콜드스타트 시 마지막 스크린 복원

## Next.js 렌더링 전략

- `app/(marketing)/*` — 정적 생성 + 1시간 ISR (B2B SEO · OG 프리뷰)
- `app/(dashboard)/*` — RSC + Supabase 서버 클라이언트 · 민감 데이터 `dynamic = 'force-dynamic'` · `no-store`
- 인터랙티브 영역(일감 목록·지원자 테이블)만 Client Component + TanStack Query
- PPR은 Next 14 실험 플래그 → M2 재검토

## Expo 구성

- **Dev build(EAS)** 유지. Bare RN 불필요. `expo-notifications`·`expo-linking`·`expo-router`로 push/deep-link/a11y 커버
- 카카오 SDK·채널톡 RN SDK는 config plugin 래핑
- OTA Update로 UI 수정 심사 없이 3~7일 내 배포. 릴리즈 주기 주 1회 압축 → 오탭 핫픽스 24시간

## 시니어 UX 베이스라인 (디자인 토큰으로 강제)

- 최소 터치 타겟 48dp
- 최소 텍스트 대비 WCAG AAA 7:1
- 기본 폰트 18pt (시스템 200% 확대 시 레이아웃 붕괴 없음)
- 팔레트: navy(`#1A2C4E`) / gray scale (사용자 선호 기준, 이모지 없음)
