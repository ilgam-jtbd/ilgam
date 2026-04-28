# 일감 (ILGAM) — 인력사무소 디지털화 + 시니어 단독 점유 (v3.1)

> "일"(Work) + "감"(感, 감각·보람). 베이비부머 954만 + **YOLD(50~64세 대기업·중견·스타트업 출신) 1,200만**을 AI 청년 세대와 융합하는 세대통합·ESG 기반 스팟워크 플랫폼. **인력사무소를 디지털화하다.**

## 포지셔닝 (v3.1 — ADR-002 v2.2)

- **수수료 단계화**:
  - **Phase 0 (M0~M5, 5개월)**: 양측 무료 검증
  - **Phase 1 (M6+, 2027.04~)**: 법인 설립 + **구인자 10% (인력사무소 표준)**, 워커 영구 0%
  - **Phase 2 (M18~M30)**: + 광고 + 자문 멤버십 부가
- **5중 해자**:
  1. **단계화 수수료** (검증 무료 → 법인 후 10%)
  2. 시니어 전담 UX (ADR-003)
  3. 공공 MOU (KORDI·50플러스·구청)
  4. **컨텐츠 QA 시스템** (ADR-010 · 4-Tier)
  5. **YOLD 자문 트랙** (대기업·중견·스타트업 출신 멘토링)
- **시장 포지셔닝**: 인력사무소 디지털화 + 시니어 단독 점유 = **Blue Ocean** (당근알바·Indeed 무료, 알바몬·급구·타이미 수수료 — 모두 시니어 전담 ×)

## 워커 세그먼트 (3 트랙)

| 트랙 | 연령 | 출신 | 카테고리 | 시급 |
|---|---|---|---|---|
| A 베이비부머 2차 | 52~62세 | 일반 사무·생산·서비스 | 물류·F&B·청소·유통 | ₩10,030~15,000 |
| B 70대 시니어 | 62~71세 | 사무·서비스·생활기술 | F&B·돌봄·청소·농업 | ₩10,030~13,000 |
| **C 욜드족 (신규)** | **65~75세** | **대기업 임원·CEO·전문가** | **자문·멘토링** | **₩50,000~300,000** |

욜드족 트랙: 대기업 출신·스타트업 성공 경험 보유 시니어를 시드~시리즈B 스타트업, 매출 50~500억 중견기업 자문(consulting)에 매칭. 단순 시급 노동의 한계 돌파 + Phase 2 광고(B2B Premium) 핵심 콘텐츠 풀.

## 수익 모델 (3 Phase · v3.1)

- **Phase 0 (M0~M5, 2026.10~2027.02)**: 양측 무료 검증. 매출 0. 자본 = Pre-Seed/Seed ₩2~3억.
- **Phase 1 (M6~M18, 2027.04~)**: **법인 설립 + 구인자 10%** (인력사무소 표준)
  - 워커 영구 0% · PortOne 에스크로 정산 부활 (ADR-004 v2.1)
  - 정부과제 ₩5천만 + TIPS ₩10억 트랙 진입
  - 메인 매출 라인 = 10% 수수료
- **Phase 2 (M18~M30)**: 광고 + 자문 멤버십 인플렉션 (ADR-011 v1.1)
  - 활성화 트리거 (3 AND): MAU ≥ 15만 · NPS ≥ +30 · QA 처리량 안정
  - 부가 라인 4종: top_banner CPC ₩250 · b2b_premium ₩30~50만/월 · **advisory_membership ₩50~200만/월** · data_insights ₩100만/월
  - **BEP M22 (월 ₩3억)**, M30 월 흑자 안정

## 3대 방어선

1. **한국노인인력개발원 MOU** — 공공 채널 독점
2. **컨텐츠 QA 시스템** — 4-Tier 자동·수동 검증 (ADR-010), 사기·악성 공고 차단이 무료 모델 신뢰 자산
3. **워커 5,000명 先手 락인** — 월 800~1,000명 확보 페이스

## 기술 스택

| 영역 | 선택 | 근거 ADR |
|---|---|---|
| 웹(구인자 어드민) | Next.js 14 App Router · RSC | [ADR-003](docs/decisions/ADR-003-frontend-stack.md) |
| 모바일(시니어 워커 앱) | React Native · Expo EAS | ADR-003, ADR-006 |
| 모노레포 | Turborepo + pnpm workspaces | ADR-001 |
| 데이터 | Supabase (Postgres · Auth · Realtime · Edge Functions) · 리전 ap-northeast-2 | ADR-005, ADR-006 |
| 결제 | PortOne (광고 결제 M18+, dormant) · 직거래 모델 (Phase 1) | ADR-004 v2, ADR-011 |
| 알림 | 카카오 알림톡(Bizppurio) 1순위 · SMS 폴백 | ADR-004 |
| 고객지원 | 채널톡(Channel.io) 전용 · 전화 미운영 · SMS 명령어 fallback | ADR-008 |
| **컨텐츠 QA** | **Claude Haiku (Tier 2 분류) + Postgres 룰 (Tier 1) + 운영자 검토 (Tier 3) + 외부 신고 (Tier 4)** | **ADR-010** |
| AI | Claude API: **컨텐츠 QA (핵심)** + CX 트리아지 — 매칭 랭킹엔 미사용 | ADR-004 v2 |
| 모니터링 | Sentry + PostHog + Supabase Logs + Uptime Kuma | ADR-006 |

## 모노레포 구조

```
apps/
  admin-web/      Next.js 14 — 구인자 어드민 + 공개 마케팅
  worker-app/     Expo RN — 시니어 워커 앱
packages/
  core/           공유 타입 · Zod 스키마 · Supabase 클라이언트
  db/             Supabase 마이그레이션 · 시드
  design-tokens/  navy/gray 팔레트 · 접근성 토큰
supabase/
  functions/      Edge Functions (Deno): match-engine · notify-dispatch · payment-settle
docs/
  product/        PRD
  architecture/   시스템·ERD·보안
  decisions/      ADR-001 ~ ADR-008
  meetings/       킥오프·스프린트 회의록
  runbook/        인시던트 런북
```

## 개발 시작

```bash
pnpm install
cp .env.example .env
pnpm dev:web        # 구인자 어드민 (http://localhost:3000)
pnpm dev:app        # 시니어 워커 앱 (Expo)
pnpm db:migrate     # Supabase 마이그레이션 push
pnpm typecheck
pnpm test
```

## 팀

- **김연재** — PO · 전사결정 · 핵심 파트너십 · KPI
- **CPO** (현직, 주 10~15h) — UX · QA · 스토어 심사
- **전략팀장** (현직, 주 10~15h) — 정부과제 · IR · 법무 · 회계
- **Claude Code** — 실구현, CPO·전략팀장 이중 게이트

## 라이선스

All rights reserved © 2026 ILGAM JTBD. 비공개 · 내부 사용 전용.
