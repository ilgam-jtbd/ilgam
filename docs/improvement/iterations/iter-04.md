# iter 04 — admin-web 공통 UI 컴포넌트 + Factory 일원화

**시각**: 2026-04-27 16:30–16:45 KST · **에이전트**: 직접 적용 (FE 권고는 iter02에서 수령)

## 변경

| 파일 | 변경 |
|---|---|
| `apps/admin-web/components/ui/FlashBanner.tsx` | 신규 — `?ok/error/warn` 3종 렌더, ARIA role 자동, 메시지 매핑(`approved/rejected/invalid_input/missing_reason`) |
| `apps/admin-web/components/ui/StatusBadge.tsx` | 신규 — `approved/suspended/pending` 3-상태 |
| `apps/admin-web/app/internal/employers/page.tsx` | inline FlashBanner/StatusBadge → 공통 컴포넌트 import (-90 LOC) |
| `apps/admin-web/app/(dashboard)/jobs/new/page.tsx` | inline `createServerClient` → `getServerSupabase()` factory 사용 (-25 LOC, ssr 마이그 시 단일 지점 유지) |

## 1인 운영 효과

- **추가 백오피스 화면**(ADR-009 신고/결제/워커) 작업 시 `<FlashBanner search={search} />` 1줄로 일관된 결과 표시
- supabase-ssr 0.5→0.6 마이그 시 `lib/supabase-server.ts` 한 곳만 수정
- 새로 추가될 페이지가 같은 토큰·메시지 매핑을 자동 상속

## 검증

- typecheck: green
- lint: green
- 기능: /internal/employers 페이지 시각적 회귀 없음 (동일 토큰)

## 미적용 (이월)

- as unknown as 캐스트 제거 (FE iter02 #4) → iter 06 후보
- 와이어프레임 _tokens.css 동기 → iter 06 (Korean 칩과 함께)
