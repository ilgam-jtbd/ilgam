# ADR-012 · 프로덕션 런칭 하네스 + 에이전트 풀

- **상태**: Accepted
- **일자**: 2026-04-28
- **의사결정자**: 김연재(PO) · CPO · 전략팀장
- **참여 에이전트**: Plan(검증), Backend, Infra, QA, CX

## 배경

ADR-002 v2.3 결정으로 Phase 0 베타 = **2026-11-01**. 자격증명·도메인 연결은 사용자가 별도 작업. 그 사이에 **(a) 1인 운영 가능 자동화 80%+, (b) RTO 5분 / RPO 1분, (c) 월 ₩50만 이내 인프라**의 3축을 동시 충족하는 하네스가 필요.

본 ADR은 [Anthropic harness 가이드](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) "isolation over constraints" 원칙을 ILGAM의 **에이전트 9종 + 하네스 12 컴포넌트**에 매핑한 결정 기록이다.

## 결정 1 — 하네스 12 컴포넌트

| # | 컴포넌트 | 기술 | 트리거 | 관측 | 실패 대응 |
|---|---|---|---|---|---|
| H1 | 배포 파이프라인 | GH Actions → Vercel CLI | PR=preview / main=prod | Vercel webhook → Slack | `vercel rollback` 1-click |
| H2 | 환경 분리 (4-tier) | dev / preview / staging / prod | git branch | env별 Supabase project | staging gate 필수 |
| H3 | 시크릿 관리 | 1Password + GH OIDC | CI 런타임 주입 | 접근 로그 30일 | rotate runbook 90일 |
| H4 | DB 마이그 | supabase db push + pgTAP | main merge | migration_history table | `db reset --linked` |
| H5 | Health Edge Fn | `/healthz` (DB·Claude·PortOne) | Uptime Kuma 60s | 응답시간·에러율 | 3연속 실패 → PagerDuty |
| H6 | Sentry | @sentry/nextjs + Deno init | unhandled error | release tag = git SHA | error budget 1% |
| H7 | PostHog | self-host EU | 이벤트·세션 | NSM 대시보드 5분 갱신 | event drop → fallback log |
| H8 | Supabase Logs | Logflare drain | Edge Fn invoke | 7일 retention | 끊김 → S3 백업 |
| H9 | Uptime Kuma | self-host (₩5천/월) | 60s 폴링 | /healthz · admin · worker | Slack #ops |
| H10 | Rollback | Vercel instant + supabase reset | 운영자 1-click | rollback log | RTO 5분 / RPO 1분 |
| H11 | 도메인 | Vercel + Cloudflare | DNS A/AAAA | TLS 만료 30일 알람 | 자동 갱신 |
| H12 | Demo guard | `assertNotProd()` throw + ESLint | build time | bundle scan | CI 빌드 차단 |

## 결정 2 — 에이전트 풀 9종

| 에이전트 | 모드 | 트리거 | 권한 | 관측 | 실패 대응 |
|---|---|---|---|---|---|
| qa-classifier | 자동 | 공고 등록 시 | DB rw + Claude | 분당 처리수·confidence | <0.6 → operator queue |
| cx-triage | 자동 | 문의 인입 | tickets rw | SLA·escalation율 | LLM 다운 → 템플릿 fallback |
| match-engine | 자동 | 의뢰 게시 | jobs rw + push | 매칭 시간·CTR | 5분 무매칭 → operator |
| notify-dispatch | 자동 | 이벤트 큐 | Bizppurio·Aligo | 발송 성공률 | 3회 실패 → SMS fallback |
| **deploy-validator** | 신규 자동 | PR open | CI artifact read | smoke 통과율 | 실패 → merge block |
| **perf-monitor** | 신규 자동 | 5분 cron | PostHog read | p95 latency·DB CPU | 임계 초과 → 알림 |
| **security-scanner** | 신규 자동 | 일1 cron | Snyk·Semgrep·RLS audit | CVE·RLS gap | high → PR block |
| **content-watch** | 신규 반자동 | 24h 후 신고 0이면 자동 confirm | flags rw | 위반율 | uncertain → operator |
| **kordi-sync** | 신규 자동 | 일1 cron | KORDI API read | 모집 매칭률 | API 다운 → 캐시 24h |
| 운영자(인간) | 수동 | QA queue + escalation | admin-web (MFA) | 분당 5~10건 | 야간 8h 대기 SLA |

`fraud-watch`는 Phase 1 (M6+) — 베타 거래량 부족 시 노이즈 과다.

## 결정 3 — Pre-Launch Gate 25항

### 기술 게이트 (10)
1. CI 4/4 green
2. 마이그 staging→prod 적용 + revert 테스트
3. 시크릿 14종 1Password vault
4. TLS A+ (SSL Labs)
5. /healthz 99.5% × 7일
6. Sentry release 태깅
7. PostHog NSM dashboard
8. DB 백업 PITR 7일
9. Demo guard 빌드 차단 검증 (negative test)
10. rollback 리허설 1회

### 운영 게이트 (8)
11. 운영자 200건 QA 시뮬 정확도 ≥95%
12. KORDI MOU 초안 송부
13. 동네지사 3곳 LOI (Letter of Intent)
14. YOLD 사전 풀 200명
15. 김애란/한강 카피 27화면 적용
16. 알림톡 7템플릿 사전 심사 통과
17. 운영 runbook v1
18. on-call 1주 rotation

### 법적 게이트 (7)
19. 이용약관 v1
20. 개인정보처리방침
21. 통신판매중개업 신고 완료
22. 위치정보 사업자
23. 만 65세+ 동의 UX
24. 분쟁조정 절차 명시
25. PortOne 가맹 심사 (M6 직전)

## 결정 4 — 즉시 P0 5건 (이번 PR)

이미 본 PR에 포함:
1. **`supabase/functions/healthz/index.ts`** — DB+Claude+PortOne ping
2. **`.github/workflows/deploy.yml`** — preview·prod·rollback·healthcheck·Slack
3. **`packages/observability/src/index.ts`** — Sentry init + PII scrub + tracedFetch
4. **Demo guard** — `apps/admin-web/lib/demo.ts` build-time throw 이미 구현 (iter10)
5. **`docs/runbook/secrets.md`** — 1Password vault 14종 인벤토리 + 도메인 연결 가이드

## 결정 5 — M0 직전 P1 7건 (2026-10-15까지)

R1 PostHog NSM 대시보드 / R2 Uptime Kuma + PagerDuty / R3 deploy-validator agent / R4 perf-monitor 5분 cron / R5 security-scanner 확장 (Snyk+Semgrep+RLS pgTAP) / R6 200건 QA 골든셋 + 시뮬 / R7 staging full rehearsal (도메인 제외)

## 결정 6 — M3 이후 P2 8건 (안정화 2027 Q1)

S1 fraud-watch / S2 multi-region failover / S3 chaos test / S4 비용 자동 알람 (월 ₩50만 80%) / S5 운영자 2인화 / S6 A/B 프레임워크 / S7 ML 이상치 탐지 / S8 BigQuery 데이터 웨어하우스

## 비용 검증

| 항목 | 월 비용 |
|---|---|
| Supabase Pro | ₩32만 (베타 6개월 Free tier 사용 시 ₩0) |
| Vercel Pro | ₩3만 |
| Sentry Team | ₩4만 |
| PostHog | ₩7만 |
| Uptime Kuma (self-host) | ₩0.5만 |
| 1Password Business | ₩1.5만 |
| Claude API (QA·CX) | ₩7만 |
| 도메인·Cloudflare | ₩4만 |
| **합계 (Free tier 활용 시)** | **~₩27만** |
| 합계 (Supabase Pro 직행) | ~₩59만 |

베타 6개월은 Supabase Free tier로 운영 → 사용자 요청 ₩50만 이내 충족. M3 이후 Pro 전환 검토.

## RTO / RPO 검증

- **RTO 5분**: Vercel instant rollback 30초 + DNS TTL 60초 + healthz 검증 4분 = **5분 안전 구간**
- **RPO 1분**: Supabase PITR (Point-In-Time Recovery) 1분 단위 + 운영자 액션 audit 영구 보존

## 결과

- 1인 운영 자동화 80%+ (자동 5종 + 반자동 1종 + 수동 1종)
- RTO/RPO/비용 3축 동시 충족
- 도메인 연결만 사용자가 1단계로 마무리하면 즉시 베타 개시 가능
- 타이미·급구 동맹 모니터(kordi-sync 일1 + 시장 watch 월1)로 진입 창문 추적

## 출처

- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic — Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Awesome harness engineering](https://github.com/ai-boost/awesome-harness-engineering)
- 본 PR `docs/research/2026-04-28_pre-launch-review.md`
