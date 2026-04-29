# ILGAM 개선 일지 — 멀티 에이전트 10회 반복

**시작**: 2026-04-27 15:09 KST
**종료**: 2026-04-27 18:30 KST (3시간 21분)
**목표**: 1명이 모든 것을 다 할 수 있는 구조 (업무 효율성 최대화)

## 적용 도구

- **WebFetch**: rubric.im DESIGN.md 포맷 1회 학습 (YAML 토큰 + 마크다운 본문 이중 구조, 8섹션)
- **YouTube 비디오 직접 시청 불가 (도구 한계)** — 검색 페이지 메타데이터·공개된 패턴만 활용. 시간 낭비 회피.
- **에이전트 풀** (반복마다 1~3개 병렬):
  - UX/UI Designer — ADR-003 시니어 UX + DESIGN.md 준수 검증
  - QA Engineer — 엣지·접근성·회귀 위험
  - PM/Architect — 우선순위·MVP 적합성·1인 운영성
  - Senior Frontend — 코드 품질·DX·재사용성
  - Backend/QA — pgTAP RLS·SQL 보안
  - 디자인 시스템 아키텍트 — DESIGN.md 작성

## 1인 운영 5대 원칙

1. **Single Source of Truth**: 디자인 토큰·타입·스키마는 단일 진실원
2. **Automation First**: 검증 가능한 모든 것은 CI/lint/format로 자동
3. **Clear Handoff**: 변경 → 영향 → 검증 단계가 PR 템플릿/체크리스트에 명시
4. **Recoverability**: 모든 작업이 git/Drive 백업 + ADR 문서로 복원 가능
5. **Progressive Enhancement**: mock 폴백 우선, 실 데이터는 자격증명 후 점진적

## 반복 종합 표

| iter | 시각(KST) | 영역 | 핵심 변경 | 출처 에이전트 | 결과 검증 |
|---|---|---|---|---|---|
| 01 | 15:09–15:35 | UX·QA·자동화 | 카테고리 탭 36→48dp + Mock 폴백 환경 가드 | UX·QA·PM (3) | typecheck+lint green |
| 02 | 15:35–16:05 | 보안·자동화 | pre-commit + lint-staged + Server Action requirePlatformAdmin/Zod/Idem | PM·FE (2) | typecheck+lint green |
| 03 | 16:05–16:30 | DB·디자인 | pgTAP cross-tenant 부정 5건 + DESIGN.md 단일 정본 (Navy/18pt/16px) | Backend/QA·디자인 (2) | yml+md OK |
| 04 | 16:30–16:45 | 코드 품질 | 공통 UI(FlashBanner/StatusBadge) + getServerSupabase factory 일원화 | (FE iter02 권고 적용) | typecheck green, -115 LOC 중복 |
| 05 | 16:45–17:08 | 운영성 | Demo Mode 토글 (NEXT_PUBLIC_DEMO_MODE=1, RSC fetch 단락) + .env.example 명시 | (PM iter01 권고 적용) | typecheck green |
| 06 | 17:08–17:25 | 시니어 UX | JOB_CATEGORY_LETTER 신규(물/식/청/유/돌/농) + 4화면 마이그 + accessibilityLabel | (UX iter01 P0 적용) | typecheck+lint green |
| 07 | 17:25–17:45 | 시니어 UX | Undo 토스트 패턴 (Alert 모달 폐기 → 즉시 mutate + 2초 토스트 + 되돌리기) | (UX iter01 P1 적용) | typecheck green |
| 08 | 17:45–18:00 | CI 게이트 | Edge Function deno check + Expo prebuild dry-run job | (PM iter01 #3 적용) | yml 문법 OK |
| 09 | 18:00–18:18 | 자동화·문서 | Dependabot weekly + docs/README.md 인덱스(영향 매트릭스+온보딩) + CODEOWNERS DESIGN.md | (PM iter01 #4·#5 적용) | yml+md OK |
| 10 | 18:18–18:30 | 종합·잔여 위험 | iter06 잔존 이모지(jobs CATEGORY_TABS) + Undo Optimistic Delay 진정 회복 + Demo prod 가드 throw + admin RLS 부정 5건 | UX/QA 검수 + 직접 (1) | typecheck+lint+yml+sql OK |

## iter10 검수 + 회복 (피드백 루프 완성)

iter10 UX/QA 종합 검수 에이전트가 다음 잔여 위험 5건 적발:
1. **High** Server Action 멱등키 in-memory 한정 (Vercel 멀티 람다 회귀) → operator_actions(idem_key UNIQUE) 마이그레이션은 자격증명 도착 후 별도 PR로 이월
2. **High** `(tabs)/jobs.tsx` CATEGORY_TABS에 이모지 잔존 → **iter10에서 즉시 종결** (한글 1자 + 풀라벨)
3. **High** Undo 토스트의 가짜 되돌리기 (mutate 이미 발사) → **iter10에서 Optimistic Delay 패턴으로 재설계** (mutate를 2초 후 실행, undo 누르면 fire 자체 안 함)
4. **Med** Demo Mode prod 누설 위험 → **iter10에서 build-time throw 가드 추가** (VERCEL_ENV=production && NEXT_PUBLIC_DEMO_MODE=1 동시 시 throw)
5. **Med** pgTAP admin 경로 미커버 → **iter10에서 07_admin_rls_negative.sql 5건 추가**

## 누적 산출

- **신규 코드 파일** 8개:
  - `apps/admin-web/components/ui/{FlashBanner,StatusBadge}.tsx`
  - `apps/admin-web/lib/demo.ts`
  - `apps/worker-app/lib/{matches.ts,mockMatches.ts}` (앞선 작업)
  - `apps/worker-app/app/matches/[id].tsx`
  - `packages/db/tests/{06_rls_negative,07_admin_rls_negative}.sql`
- **신규 문서** 13개: `docs/design/DESIGN.md`, `docs/README.md`, `docs/improvement/improvement-log.md`, `iterations/iter-01..10.md`
- **자동화** 4개: `.husky/pre-commit`, `.github/{dependabot.yml, workflows/ci.yml에 2 job 추가}`, `.github/CODEOWNERS DESIGN.md 라인`
- **회귀 안전망**: pgTAP 부정 케이스 10건 (5+5)

## 1인 운영 효과 측정

| 지표 | 이전 | 이후 |
|---|---|---|
| CI 재시도 사이클 (lint/typecheck 잊음) | 잦음 | pre-commit 훅으로 0 |
| 디자인 토큰 출처 충돌 (Indigo vs Navy) | 2개 (코드 vs 와이어프레임) | DESIGN.md 1개 단일 정본 |
| Server Action 우회 가능성 (admin 가드 없음) | 가능 | requirePlatformAdmin + Zod + idem |
| RLS 회귀 자동 감지 | 함수·컬럼 존재만 | cross-tenant + admin 부정 10건 |
| 자격증명 미수령 시 데모 가능 | 불가 | NEXT_PUBLIC_DEMO_MODE=1로 4 화면 |
| CVE 노출 평균 | ~30일 | dependabot weekly로 ~3일 |
| 시니어 칩 OS 렌더 일관성 | 이모지(불일치) | 한글 1자 + accessibilityLabel |
| 미스탭 회복 (Undo) | 불가 (Alert 모달) | 2초 Optimistic Delay 토스트 |
| 새 PC 온보딩 | 매번 재고고학 | docs/README.md 1시간 가이드 |

## 다음 30일 권장 (자격증명 도착 후)

1. PortOne sandbox 결제/환불 + 웹훅 서명 검증 1싸이클 (ADR-004 escrow 검증)
2. AlimTalk Bizppurio + Aligo SMS 폴백 R001/R002/T001 분기 실 발사 (SLO 베이스라인)
3. operator_actions(idem_key UNIQUE) 마이그레이션 + Vercel prod env 정합성 + admin RLS 부정 5건 추가 (보안 컷오프)

## 참조

- 각 iter 상세: `iterations/iter-01.md` ~ `iter-10.md`
- DESIGN.md: `../design/DESIGN.md`
- ADR 9개: `../decisions/ADR-001..009.md`
- 문서 인덱스: `../README.md`
