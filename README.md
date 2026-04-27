# 일감 (ILGAM) — 한국형 시니어 스팟워크 플랫폼

> "일"(Work) + "감"(感, 감각·보람). 베이비부머 2차(1964~1974년생, 954만명) + 70대 액티브 시니어(1955~1964년생)를 AI 청년 세대와 융합하는 세대통합·ESG 기반 스팟워크 플랫폼.

## 포지셔닝

- 수수료율: 15~20% (보수적 설계, M1 워커 0% · 구인자 15% 시작)
- 차별화: 시니어(베이비부머 2차) 전담 UX · 공공 MOU 채널 독점 · 동네지사 오프라인 보조
- 진입 창문: 9~12개월 (시니어 버티컬 신규 진입 임계 도달 전 선점)

## 3대 방어선

1. **한국노인인력개발원 MOU** — 공공 채널 독점
2. **SMS + 오프라인 현장 + 동네지사 3중 UX** — 정보화진흥원 60~74세 앱 이탈 60~70% 실증 근거
3. **워커 5,000명 先手 락인** — 월 800~1,000명 확보 페이스

## 기술 스택

| 영역 | 선택 | 근거 ADR |
|---|---|---|
| 웹(구인자 어드민) | Next.js 14 App Router · RSC | [ADR-003](docs/decisions/ADR-003-frontend-stack.md) |
| 모바일(시니어 워커 앱) | React Native · Expo EAS | ADR-003, ADR-006 |
| 모노레포 | Turborepo + pnpm workspaces | ADR-001 |
| 데이터 | Supabase (Postgres · Auth · Realtime · Edge Functions) · 리전 ap-northeast-2 | ADR-005, ADR-006 |
| 결제·정산 | PortOne 에스크로 + 통신판매중개업 모델 | ADR-004 |
| 알림 | 카카오 알림톡(Bizppurio) 1순위 · SMS 폴백 | ADR-004 |
| 고객지원 | 채널톡(Channel.io) 전용 · 전화 미운영 · SMS 명령어 fallback | ADR-008 |
| AI | Claude API (공고 요약 · CX 트리아지) — 매칭 랭킹엔 미사용 | ADR-004 |
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
