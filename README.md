# VELOR — 검증된 시니어 전문가 네트워크

> 임원 출신 전문가의 경험을 지금 바로 빌려드립니다.  
> 2,400명의 검증된 시니어 전문가와 850개 기업을 연결하는 스팟워크 플랫폼.

**운영사: JTBD** | 도메인: [velor.kr](https://velor.kr) | PO: 김연재

---

## 서비스

| 서비스 | 설명 | 가격 |
|---|---|---|
| **프로젝트 자문** | 주 1~3일, 1개월~6개월 프로젝트 | 협의 |
| **원포인트 자문** | 1~2시간 집중 자문 | 30만원~/시간 |
| **인재추천·스카웃** | 검증된 시니어 전문가 채용 연결 | 협의 |

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 모노레포 | Turborepo + pnpm workspaces |
| 랜딩/B2B 플랫폼 | Next.js 14 App Router (platform-web) |
| 어드민 대시보드 | Next.js 14 App Router (admin-web) |
| 워커 모바일 앱 | Expo React Native (expo-router) |
| 백엔드 | Supabase (PostgreSQL 15, RLS, Edge Functions) |
| Edge Functions | Deno 2.x |
| 결제·정산 | PortOne 에스크로 |
| 알림 | 카카오 알림톡 + SMS 폴백 |
| AI | Claude API (CX 트리아지·공고 요약) |
| CRO | VWO A/B Testing + PostHog analytics |

## 모노레포 구조

```
apps/
  platform-web/   Next.js — VELOR 랜딩 + B2B 플랫폼 (velor.kr)
  admin-web/      Next.js — 운영 어드민 대시보드
  worker-app/     Expo RN — 시니어 워커 앱
packages/
  core/           공유 타입 · Zod 스키마 · KST 유틸
  db/             migrations/ (0001~0012) · pgTAP tests/
  design-tokens/  VELOR 디자인 시스템 토큰
supabase/
  functions/      Edge Functions: match-engine · notify-dispatch
                  payment-settle · clock · cx-triage · healthz
docs/
  runbook/        velor-kr-domain-setup.md · secrets.md
scripts/
  deploy-platform-web.sh    Vercel 자동 배포
  migrate-to-velor-repo.sh  ilgam-jtbd/velor 리포 이전
  verify_deployment.sh      DNS·SSL·healthz 검증
```

## 개발 시작

```bash
pnpm install
cp .env.example .env.local   # Supabase URL/KEY 입력

pnpm dev                     # 전체 앱 동시 실행
# 또는 개별 실행:
pnpm --filter @ilgam/platform-web dev   # http://localhost:3000
pnpm --filter @ilgam/admin-web dev      # http://localhost:3001

pnpm turbo lint typecheck test          # 전체 검증 (16 tasks)
```

## 배포

```bash
# Vercel platform-web
export VERCEL_TOKEN=<token>
export SUPABASE_ANON_KEY=<key>
bash scripts/deploy-platform-web.sh --prod

# DB 마이그레이션
supabase db push

# 도메인 검증
bash scripts/verify_deployment.sh velor.kr
```

velor.kr DNS 설정: `docs/runbook/velor-kr-domain-setup.md` 참조.

## 절대 수정 금지 파일

| 파일 | 이유 |
|---|---|
| `supabase/functions/match-engine/index.ts` | 매칭 알고리즘 — 양면 시장 붕괴 위험 |
| `supabase/functions/payment-settle/index.ts` | 결제·정산 HMAC — 버그 = 실제 금전 손실 |
| `supabase/functions/qa-classifier/` | 컨텐츠 QA 4-tier (특허 연계) |

## 팀

- **김연재** — PO · JTBD 대표
- **Claude Code** — 실구현 엔지니어링

---

All rights reserved © 2026 JTBD. Private repository.
