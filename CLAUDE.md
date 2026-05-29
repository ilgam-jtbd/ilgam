# CLAUDE.md — VELOR v3.3

> Claude Code 세션 진입 시 자동 로드. 모든 에이전트·세션 공유 권위 파일.

---

## 1. 프로젝트 개요

**VELOR** — 베이비부머(50~64세) 대상 시니어 전문가 AI 매칭 플랫폼  
브랜드: VELOR | 운영사: JTBD | PO: 김연재 | 도메인: velor.kr  
조직: ilgam-jtbd | 리포: ilgam-jtbd/ilgam → 최종: ilgam-jtbd/velor

| 항목 | 값 |
|---|---|
| Phase | 0 검증 (2026.10~2027.02) |
| 수익 모델 | Phase 0 무료 → Phase 1 구인자 10% 수수료 |
| NSM | 매칭 완료 수 (워커 × 구인자 양면) |
| 자금 목표 | Seed ₩2~3억 + 정부과제 ₩5천만 |

---

## 2. 기술 스택

| 레이어 | 기술 |
|---|---|
| 모노레포 | Turborepo + pnpm workspaces |
| 어드민 웹 | Next.js 14 App Router (RSC + `createServerClient`) |
| 워커 앱 | Expo React Native (expo-router) |
| 백엔드 | Supabase (PostgreSQL 15, RLS, Edge Functions) |
| Edge Functions | Deno 2.x (`Deno.serve()`) |
| DB 테스트 | pgTAP |
| 타입 | TypeScript strict (apps), `noImplicitAny: false` (edge functions) |
| 디자인 | YJKim Design System v1.0 — navy `#0d1b2a` · gold `#c9a84c` · teal `#2dd4bf` |

### 패키지 구조

```
apps/
  admin-web/     # Next.js 어드민 대시보드
  worker-app/    # Expo 워커 모바일 앱
packages/
  core/          # 공유 유틸 (KST, schemas, zod)
  db/            # migrations/, tests/ (pgTAP)
  design-tokens/ # 디자인 시스템 토큰
supabase/
  functions/     # Edge Functions (Deno 2.x)
    clock/       # 출퇴근 체크 + 급여 계산
    cx-triage/   # CX 인입 분류 (Claude API)
    healthz/     # 헬스체크
    match-engine/# 매칭 랭킹
    notify-dispatch/ # 알림톡 + SMS 폴백
    payment-settle/  # PortOne 웹훅 정산
```

---

## 3. 절대 불변 파일 (CONSTRAINTS)

아래 3개 파일은 **어떤 세션에서도 수정 금지**. 수정 필요 시 PO 승인 후 별도 PR.

| 파일 | 이유 |
|---|---|
| `supabase/functions/qa-classifier/` | 컨텐츠 QA 4-tier 핵심 로직 (특허 연계) |
| `supabase/functions/match-engine/index.ts` | 매칭 알고리즘 — 변경 시 양면 시장 붕괴 위험 |
| `supabase/functions/payment-settle/index.ts` | 결제·정산 HMAC 검증 — 버그 = 실제 금전 손실 |

---

## 4. 시간 표준

**모든 시간 표시는 KST(Asia/Seoul, UTC+9) 기준.**

```typescript
// packages/core/src/kst.ts 사용
import { fmtKST, fmtKSTDate, nowKST } from "@ilgam/core";
```

DB 저장: UTC (Supabase 기본값 유지)  
표시·로그: KST 변환 후 출력

---

## 5. DB 마이그레이션 규칙

- 파일명: `packages/db/migrations/NNNN_<name>.sql` (4자리 순번)
- 현재 최신: `0006_shifts_status_employer_onboarding.sql`
- 신규 마이그: `0007_` 부터 시작
- 모든 테이블에 RLS 활성화 필수 (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- pgTAP 테스트: `packages/db/tests/NN_rls_<name>.sql` 에 동시 작성

---

## 6. 코딩 규칙

- **Next.js cookies()**: SYNC 호출 (`cookies()` — `await` 없음)
- **Supabase 중첩 관계 타입**: `as unknown as T[]` 캐스트 사용
- **Edge Function**: `Deno.serve()` 사용 (std `serve` 사용 금지)
- **Crypto**: `globalThis.crypto.subtle` 사용 (std crypto import 금지)
- **주석**: WHY가 명확하지 않으면 작성 금지
- **에러 처리**: 시스템 경계(사용자 입력, 외부 API)에서만 검증

---

## 7. CI 구조

```yaml
jobs:
  lint-type-test:   # pnpm turbo lint typecheck test
  db-rls-tests:     # pgTAP (non-fatal warning on failure)
  edge-function-types: # deno check (non-fatal warning on failure)
```

PR 기준 브랜치: `main`, `develop`  
모든 브랜치 push에 CI 실행.

---

## 8. /goal 템플릿 (klöss 9섹션)

Claude Code에 작업을 지시할 때 아래 형식을 사용한다.  
**모든 /goal은 9섹션 완전 작성 필수.**

```
/goal

## 1. GOAL  ← 측정 가능한 단일 완료 조건 (모호한 표현 금지)
[예: "platform-web /api/openapi GET → 200 + OpenAPI 3.0 스펙 반환"]

## 2. CONTEXT  ← 배경 정보
- Phase: [0 검증 | 1 유료화 | ...]
- 관련 파일: [파일 경로 목록]
- 배경: [왜 이 작업이 필요한지 — 비즈니스·기술 이유]

## 3. CONSTRAINTS  ← 건드리면 안 되는 것 (하드 금지)
- supabase/functions/qa-classifier/ 수정 금지
- supabase/functions/match-engine/index.ts 수정 금지
- supabase/functions/payment-settle/index.ts 수정 금지
- [추가 제약 — 예: "기존 DB 스키마 변경 금지"]

## 4. PRIORITY  ← 작업 순서·우선 판단 기준
1. [가장 먼저 해야 할 것 — 블로커 해소]
2. [핵심 기능 구현]
3. [테스트·문서화]

## 5. PLAN  ← 단계별 실행 계획 (체크박스)
- [ ] Step 1: ...
- [ ] Step 2: ...
- [ ] Step 3: ...

## 6. DONE WHEN  ← 완료 판단 조건 (= SUCCESS_CRITERIA)
- [ ] [구체적 완료 조건 1 — 예: "GET /api/healthz → {"ok":true}"]
- [ ] [구체적 완료 조건 2]
- [ ] [구체적 완료 조건 3]
- [ ] `pnpm turbo lint typecheck test` 16/16 tasks 통과
- [ ] git push + PR opened

## 7. VERIFY  ← 검증 방법
- 빌드: `pnpm turbo build --filter=@ilgam/platform-web`
- 테스트: `pnpm turbo lint typecheck test`
- 수동: [확인할 화면/API/동작 — 예: "curl https://velor.kr/api/healthz"]

## 8. OUTPUT  ← 산출물 형식·위치
- 파일: [생성·수정 파일 목록]
- 커밋: `feat|fix|docs|refactor(scope): 한 줄 설명`
- PR: draft PR → main (ilgam-jtbd/ilgam)

## 9. STOP RULES  ← 강제 중단 조건 (하드 리밋)
- supabase/functions/qa-classifier/ 수정 감지 시 → 즉시 중단 + PO 보고
- supabase/functions/match-engine/index.ts 수정 감지 시 → 즉시 중단 + PO 보고
- supabase/functions/payment-settle/index.ts 수정 감지 시 → 즉시 중단 + PO 보고
- 20턴 초과 시 → 현재 상태 커밋 후 중단 + 진행상황 보고
- 동일 오류 3회 반복 시 → 중단 + 근본 원인 보고
- DB 데이터 삭제·덮어쓰기 가능 작업 → PO 확인 후 진행
- 빌드 비용 $10 초과 예상 시 → PO 확인 후 진행
```

### /goal 작성 핵심 원칙

| 섹션 | 핵심 |
|---|---|
| GOAL (1) | 모호 금지 — "동작한다" ❌ → "curl → 200 + JSON" ✅ |
| DONE WHEN (6) | = SUCCESS_CRITERIA. 조건이 명확해야 Claude가 자체 판단 가능 |
| STOP RULES (9) | 하드 리밋을 조건 자체에 박아둘 것 — 매 턴 evaluator가 확인 |
| CONSTRAINTS (3) | qa-classifier · match-engine · payment-settle 항상 포함 |

---

## 9. 주요 환경변수 (로컬 `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORTONE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
SLACK_P0_WEBHOOK_URL=
```

secrets 전체 목록: `docs/runbook/secrets.md`

---

## 10. 복귀 체크리스트

새 세션 시작 시:

```
1. git log --oneline -5          # 최근 커밋 확인
2. git status                    # 미완료 작업 확인
3. pnpm turbo lint typecheck test # 현재 상태 검증
4. docs/meetings/ 최신 파일 확인  # 마지막 의사결정 확인
```

---

*최초 작성: Claude Code · 2026-05-16 KST · v3.2*
