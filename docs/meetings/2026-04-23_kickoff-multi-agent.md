# 킥오프 — 멀티 에이전트 토론 (2026-04-23)

## 참석

- **김연재** (PO) — 전사결정·KPI
- **CPO** (현직, 가상 시뮬) — UX·QA
- **PO** (김연재와 동일, 별 세션)
- **Frontend 엔지니어** (가상 에이전트)
- **Backend 엔지니어** (가상 에이전트)
- **DB 전문가** (가상 에이전트)
- **Infra/DevOps** (가상 에이전트)
- **QA 엔지니어** (가상 에이전트)
- **CX 엔지니어** (가상 에이전트)

## 안건

1. 일감(ILGAM) MVP 아키텍처 의사결정
2. 한국형 시니어 스팟워크 진입 창문(9~12개월) 내 실행 가능한 초기 커밋 범위
3. 급구(브릿지 80억) · 당근알바(MAU 2,100만) 2축 경쟁 대응 기술 해자

## 결정사항 (ADR 링크)

- [ADR-001](../decisions/ADR-001-monorepo-tooling.md) Turborepo + pnpm workspaces
- [ADR-002](../decisions/ADR-002-product-nsm-mvp.md) NSM = 월 완료 매칭 · 워커 先 포화 · 서울 3구 · 버티컬 물류/F&B · 수수료 구인자 15%/워커 0%
- [ADR-003](../decisions/ADR-003-frontend-stack.md) Next.js 14 RSC + Expo RN + TanStack Query + Zustand · 검색창 없음
- [ADR-004](../decisions/ADR-004-backend-matching-payment.md) RPC + Edge Function 매칭 · PortOne 에스크로 · 통신판매중개업 · pg-boss 큐 · tRPC 얇은 레이어
- [ADR-005](../decisions/ADR-005-database-schema-rls.md) private 스키마 PII 분리 · RLS 3축 · 3-티어 정산 롤업
- [ADR-006](../decisions/ADR-006-infrastructure.md) Vercel + Supabase Seoul + EAS + 1Password SSOT · 모니터링 월 15만 상한
- [ADR-007](../decisions/ADR-007-qa-strategy.md) Vitest/Jest/Playwright/Maestro · pgTAP 24케이스 · 3단 릴리스 게이트
- [ADR-008](../decisions/ADR-008-cx-automation.md) 채널톡 단일 허브 · SMS 명령어 fallback · Claude 2단 파이프 · 3트랙 신고

## 이견 · 미해결 · 후속

- **매칭 엔진에 LLM 도입 시점**: Backend는 M3 이후 Python worker 분리 제안 / CPO는 "매칭 랭킹 LLM 절대 안 됨"에 강경. 합의 = M3 트리거 도달 시 PO 재심의
- **당일정산 운영자금 5천만~1억**: 자금 책임자 공란(v1.5 FINAL 팀 역할 정의 기준). M1 자금 라운드 마감 전 별도 의제 필요
- **동네지사 3개**: 강서·송파·성북 가설 검증은 공공 MOU 협상 후 최종 확정. M1 예비 2주 내 결정
- **카카오 알림톡 템플릿 사전심사**: Bizppurio 기준 2~3주 → M1 킥오프 즉시 착수

## Action Items

| # | 내용 | 담당 | 기한 |
|---|---|---|---|
| 1 | SSH 키 GitHub `ilgam-jtbd` 조직 등록 | 김연재 | 2026-04-23 |
| 2 | Supabase 프로젝트 생성 (ap-northeast-2) | 김연재 | 2026-04-24 |
| 3 | PortOne 가맹점 신청 (에스크로) | 전략팀장 | 2026-04-30 |
| 4 | 알림톡 템플릿 6종 사전심사 | Claude Code | 2026-05-02 |
| 5 | 한국노인인력개발원 MOU 초안 | 전략팀장 | 2026-05-07 |
| 6 | 동네지사 3개 입지 최종 확정 | 김연재 + CPO | 2026-05-07 |

## 회의록 메타

- 형식: 8개 에이전트 병렬 Q&A 수집 → ADR 8건으로 구조화
- 토론 시간: 약 6분 병렬 (순차였다면 40분+)
- 문서화: ADR-001~008 + 본 회의록
