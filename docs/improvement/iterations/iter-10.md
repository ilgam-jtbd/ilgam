# iter 10 — 최종 통합 QA + 잔여 위험 회복 + 종합 표

**시각**: 2026-04-27 18:18–18:30 KST
**에이전트**: UX/QA 종합 검수 1개 + 메인 직접 회복

## iter01–09 검수 결과 (종합 에이전트)

### 잔여 위험 5건 (검수 후 제기)

| # | 위험 | urgency | iter10 처리 |
|---|---|---|---|
| 1 | Server Action 멱등키 in-memory 한정 (Vercel 멀티 람다) | Med | **이월** — operator_actions(idem_key UNIQUE) 마이그레이션은 자격증명 도착 후 별도 PR |
| 2 | `(tabs)/jobs.tsx` CATEGORY_TABS에 이모지 📦🍽️🧹 잔존 (iter06 일관성 깨짐) | High | **종결** — 한글 1자 + 풀라벨로 통일 |
| 3 | Undo 토스트가 가짜 되돌리기 (mutate 이미 발사됨, 클라이언트 state만 복원) | High | **종결** — Optimistic Delay 패턴 (mutate를 2초 후 실행, undo 누르면 fire 자체 안 함) |
| 4 | Demo Mode prod 누설 위험 (NEXT_PUBLIC_DEMO_MODE=1 실수 주입 시) | Med | **종결** — `lib/demo.ts`에 prod throw 가드 추가 (VERCEL_ENV=production && demo=1 동시 시 build-time error) |
| 5 | pgTAP admin·private·operator_actions 경로 미커버 | Med | **종결** — `07_admin_rls_negative.sql` 5건 추가 |

### iter01–09 한 줄 평가

- iter01 카테고리 탭 48dp + Mock 가드 — **잘 됨**
- iter02 pre-commit + Server Action 가드 — 잘 됨, 분산 멱등은 미흡 (이월)
- iter03 pgTAP 부정 5건 + DESIGN.md — **잘 됨**, 단일 정본 확립
- iter04 공통 UI + factory 일원화 — **잘 됨**
- iter05 Demo Mode 토글 — 부족 (prod 가드 약함) → iter10 종결
- iter06 한글 1자 칩 — 부족 (jobs 탭 미반영) → iter10 종결
- iter07 Undo 토스트 — 부족 (가짜 되돌리기) → iter10 종결
- iter08 CI Edge deno + Expo prebuild — **잘 됨**
- iter09 Dependabot + 인덱스 + CODEOWNERS — **잘 됨**

## iter10 변경

| 파일 | 변경 |
|---|---|
| `apps/worker-app/app/(tabs)/jobs.tsx` | CATEGORY_TABS 6개 항목을 `JOB_CATEGORY_LETTER`/`LABEL`로 동적 생성, ⚡ 즉시정산 → "즉시정산" + accessibilityLabel |
| `apps/worker-app/app/job/[id].tsx` | handleApply: 즉시 mutate → setTimeout 안에서 mutate (Optimistic Delay). undo 누르면 mutate 자체 발사 안 됨 |
| `apps/admin-web/lib/demo.ts` | `_isProd && _rawDemo` 동시 활성화 시 build-time throw |
| `packages/db/tests/07_admin_rls_negative.sql` | 신규 5건 (worker→platform_admins SELECT, 비활성 admin INSERT, anon→operator_actions, worker→private.workers_tax_identity, worker→app.log_operator_action) |

## 다음 30일 권장 (자격증명 도착 후)

1. **PortOne sandbox 결제/환불 1싸이클** + payment-settle 웹훅 서명 검증 — ADR-004 escrow 가정 실측
2. **Bizppurio AlimTalk + Aligo SMS 폴백** R001/R002/T001 분기 실 발사 — 알림 SLO 첫 베이스라인
3. **operator_actions(idem_key UNIQUE) 마이그레이션** + Vercel prod env 정합성 audit — 분산 멱등 + 배포 직전 보안 컷오프

## 검증 (iter10 회복 후)

- typecheck + lint: green (admin-web + worker-app + core, 6 task all pass)
- pgTAP: SQL 문법 OK (CI에서 실행 예정)
- 누적 신규/수정 11 파일 / +447 / -47 LOC
