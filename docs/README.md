# ILGAM 문서 인덱스

1인 운영 + 6개월 후 본인 재고고학 비용을 줄이기 위한 문서 색인. PR 작성 시 변경 영향 영역을 이 표에서 찾아 해당 문서 갱신.

## ADR (의사결정 기록)

| # | 영역 | 핵심 결정 | 변경 시 영향 검사 |
|---|---|---|---|
| [001](decisions/ADR-001-monorepo-tooling.md) | 모노레포 | Turborepo + pnpm workspaces | `turbo.json`, `pnpm-workspace.yaml` |
| [002](decisions/ADR-002-product-nsm-mvp.md) | Product NSM | 월 완료 매칭, 워커 先 포화, 서울 3구 | PRD, 마케팅 페이지 |
| [003](decisions/ADR-003-frontend-stack.md) | Frontend | Next.js RSC + Expo + 시니어 UX 베이스라인 | DESIGN.md, design-tokens |
| [004](decisions/ADR-004-backend-matching-payment.md) | 매칭·결제 | 매칭 RPC + 가중합 + PortOne 에스크로 | match-engine, payment-settle |
| [005](decisions/ADR-005-database-schema-rls.md) | DB 스키마·RLS | 3축 RLS (worker/employer/admin) | migrations + pgTAP |
| [006](decisions/ADR-006-infrastructure.md) | 인프라·시크릿 | Vercel + Supabase + 1Password Business | .env.example, security.md |
| [007](decisions/ADR-007-qa-strategy.md) | QA | 3-게이트 (merge / staging / prod) | CI yml, smoke tests |
| [008](decisions/ADR-008-cx-automation.md) | CX | 채널톡 + Claude intent 분류 | cx-triage Edge Function |
| [009](decisions/ADR-009-operator-backoffice.md) | 운영자 백오피스 | platform_admins + MFA 4h + operator_actions | /internal/* + Server Actions |

## 디자인 시스템

- **[DESIGN.md](design/DESIGN.md)** — Google Labs 포맷 (YAML 토큰 + 8섹션). 단일 정본은 `packages/design-tokens/src/index.ts`, 본 문서는 해설.

## 아키텍처

- [system.md](architecture/system.md) — 전체 시스템·플로우 다이어그램
- [ERD.md](architecture/ERD.md) — 데이터 모델 ER
- [security.md](architecture/security.md) — PII·결제·인증 표면 정리

## Product

- [PRD.md](product/PRD.md) — 일감 MVP 정의 + M1·M3 목표

## 운영·운영자

- [operations/kakao_alimtalk_templates_v1.md](operations/kakao_alimtalk_templates_v1.md) — 알림톡 템플릿 12종 (BIZPPURIO 등록용)
- [runbook/deploy.md](runbook/deploy.md) — 배포 절차 + 스모크 게이트
- [runbook/incident-P0.md](runbook/incident-P0.md) — 결제·PII·서비스 다운 P0 인시던트

## 파트너십

- [partnership/KORDI_MOU_proposal_v1.md](partnership/KORDI_MOU_proposal_v1.md) — 한국노인인력개발원 협약 제안서

## 회의록

- [meetings/](meetings/) — 킥오프·스프린트·자율 토론 기록

## 개선 로그

- [improvement/improvement-log.md](improvement/improvement-log.md) — 멀티 에이전트 10회 반복 개선 일지 (UX/QA/PM/FE/BE)
- [improvement/iterations/](improvement/iterations/) — iter-01 ~ iter-10 상세

## 변경 영향 매트릭스 (PR 템플릿용)

```
[ ] DB 스키마/RLS  → packages/db/migrations + tests + ADR-005 + security.md
[ ] 결제·정산      → ADR-004 + supabase/functions/payment-settle + security.md
[ ] PII 처리       → security.md + private 스키마 + ADR-005
[ ] 운영자 액션    → ADR-009 + operator_actions migration + RLS test
[ ] UX/접근성     → DESIGN.md + ADR-003 + 스크린샷 + WCAG AAA 체크
[ ] 알림 템플릿   → operations/kakao_alimtalk_templates_v1.md + BIZPPURIO 재승인
[ ] CI·릴리스     → .github/workflows/ + ADR-007
[ ] CX·고객지원   → ADR-008 + cx-triage RAG 인덱스
```

## 1시간 온보딩 체크리스트

새 PC 또는 외주/공동창업자 합류 시:
1. `git clone git@github.com:ilgam-jtbd/ilgam.git`
2. `pnpm install` (husky prepare 자동)
3. `cp .env.example .env` 후 1Password Vault에서 키 동기
4. `pnpm db:migrate` (로컬 Supabase) → `pg_prove packages/db/tests/*.sql` 통과 확인
5. `pnpm dev:web` + `pnpm dev:app` 둘 다 정상 부팅
6. ADR 9개 + DESIGN.md 1회 통독 (1시간 이내)
7. 첫 PR은 [pull_request_template.md](../.github/pull_request_template.md) 영향 매트릭스 작성
