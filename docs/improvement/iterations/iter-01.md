# iter 01 — 멀티 에이전트 베이스라인 진단 + Quick Wins

**시각**: 2026-04-27 15:09–15:35 KST · **에이전트**: UX/UI · QA · PM 3개 병렬

## 에이전트 진단 (요약)

### UX/UI Designer (P0–P2 5개)
- **P0** 디자인 토큰 이중화 — `_tokens.css` (Indigo) vs `index.ts` (Navy) 어긋남. DESIGN.md 단일 정본 통합 필요. 베이스 18→**20pt**(75–79세 추가 고려) 권장.
- **P0** 이모지 혼용 — 📦🍽️🧹가 OS별 렌더 차이 + 스크린리더 발음 불일치. 한글 1자 칩(청·경·주·시·운) 또는 단색 SVG 권장.
- **P1** 카테고리 탭 36dp → ADR-003 베이스라인(48dp) 위반. 시니어 미스탭 핵심 위치.
- **P1** 미스탭 복구 — Alert 모달 → Undo 토스트(2s) 패턴. ADR-003 motion.undoTimeoutMs.
- **P2** 예상수령액 위계 — 시급 36pt vs 수령액 30pt 역전. "내가 받는 돈"이 가장 커야 함.

### QA Engineer (High×3, Med×2)
- **High** Server Action 권한 가드 부재 — `approveEmployer/rejectEmployer`가 RLS+SECURITY DEFINER만 의존, layout 가드는 페이지 렌더에만 적용. POST endpoint는 layout 통과 안 함.
- **High** mock 폴백 prod 활성화 위험 — `EXPO_PUBLIC_SUPABASE_*` 누락 빌드에서 워커가 가짜 매칭으로 실제 출근 가능.
- **High** pgTAP 부정-경로 커버리지 부족 — cross-tenant SELECT/UPDATE 차단 부정 케이스 0건.
- **Med** axe/Sentry CI 미통합 — staging 게이트 명시되었으나 PR CI에는 lint/typecheck/test/pgTAP만.
- **Med** Server Action Zod/CSRF/idempotency 누락 — UUID 검증, 더블 클릭 방지, 멱등키 부재.

### PM/Architect (High×3, Med×2)
- **High** pre-commit + lint-staged 자동화 (25m) — CI 재시도 사이클 제거, 1인 운영에서 가장 큰 시간 누수.
- **High** Demo Mode 토글 (60m) — 자격증명 도착 전 Vercel preview에 KORDI/투자자 데모용 배포.
- **High** CI에 `expo prebuild` + Edge Function `deno check` (40m) — ADR-007 머지 게이트 강제.
- **Med** Dependabot + CodeQL (20m) — PII·결제 코드베이스 CVE 노출 30→3일.
- **Med** ADR/런북 단일 인덱스 + 변경 영향 매트릭스 (30m).

## iter 01 적용 (cross-cutting High leverage / Low cost)

| 항목 | 출처 | 변경 | 검증 |
|---|---|---|---|
| 카테고리 탭 48dp + 16pt | UX P1 | `(tabs)/jobs.tsx:245-264` minHeight 36→48, fontSize sm→base | typecheck+lint green |
| Mock 폴백 환경 가드 | QA High | `lib/supabase.ts` `isMockAllowed` 추가 (DEV 또는 EXPO_PUBLIC_ALLOW_MOCK), `lib/{jobs,matches}.ts` 가드 적용 | typecheck+lint green |

## 미적용 (다음 반복으로 이월)

- **iter 02 후보**: pre-commit + lint-staged (PM High, 25m)
- **iter 03 후보**: Server Action 권한 가드 (QA High) + Zod 검증 (QA Med)
- **iter 04 후보**: DESIGN.md 단일 정본 작성 (UX P0)
- **iter 05 후보**: Demo Mode 토글 (PM High)
- **iter 06 후보**: pgTAP 부정 케이스 (QA High)
- **iter 07 후보**: 카테고리 이모지 → 한글 칩 (UX P0)
- **iter 08 후보**: Undo 토스트 패턴 (UX P1)
- **iter 09 후보**: CI에 expo prebuild + deno check (PM High)
- **iter 10 후보**: Dependabot + CodeQL + ADR 인덱스 (PM Med×2)

## 목표 정합 (1인 운영)

- 토큰 단일화 + 자동화 + 명시적 mock 가드 = 사람이 매번 검토할 영역 축소
- 다음 반복부터는 자동화/문서/단일 정본에 집중 → 핸드오프 제로화
