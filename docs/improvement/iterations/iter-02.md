# iter 02 — 자동화 + Server Action 보안 가드

**시각**: 2026-04-27 15:35–16:05 KST · **에이전트**: PM/Architect + Senior FE 2개 병렬

## 에이전트 진단

### PM/Architect (코드 스니펫 제공)
- **A. pre-commit + lint-staged 셋업** (Husky v9, ESLint --cache + Prettier, 1초 내 종료)
- **B. Server Action 가드** — `requirePlatformAdmin()` (active=true admin + MFA 4h) + Zod (UUID/reason/idem_key) + per-process LRU dedup + negative event 기록

### Senior FE (5개 코드 품질 갭)
- Server Action 보일러플레이트 중복 → `withOperatorAction` HOF (45m, 다음 이터)
- `getServerSupabase` factory 일원화 (15m, 다음 이터)
- FlashBanner/StatusBadge/inputBase 공통 컴포넌트 추출 (40m)
- `as unknown as` 캐스트 → Zod parse 또는 generated Database 타입 (30m)
- 미사용 import / dead code 정리 + `eslint-plugin-unused-imports` (20m)

## iter 02 적용

| 항목 | 출처 | 변경 |
|---|---|---|
| pre-commit + lint-staged 설정 | PM A | `package.json` scripts/devDependencies/lint-staged 필드 추가, `.husky/pre-commit` 작성 |
| Server Action 권한·입력 가드 | PM B + QA High | `actions.ts`에 `requirePlatformAdmin` + Zod + 멱등키 + `logDenied` 적용 (approve/reject 둘 다) |
| idem_key form 인풋 | PM B | `page.tsx` form에 `<input type="hidden" name="idem_key" value="apv_/rej_" + employer.id + Date.now()/>` |

## 검증

- typecheck + lint: green (admin-web)
- pre-commit hook은 새 PC에서 `pnpm install` 후 husky prepare 자동 실행으로 활성화

## 미적용 (이월)

- pgTAP 부정 케이스 추가 (QA High) → iter 03
- `withOperatorAction` HOF + factory 일원화 (FE 1·2) → iter 04
- 공통 UI 컴포넌트 추출 (FE 3) → iter 05
- as unknown as 제거 (FE 4) → iter 06

## 1인 운영 효과

- pre-commit 훅 = "로컬 typecheck 잊음" 사고 0
- Server Action 가드 = layout 우회 POST 시도 자동 차단 + 음성 audit 트레일
- 멱등키 = 더블 클릭 silent 무시 (UX) + DB unique 추가 시 분산도 안전
