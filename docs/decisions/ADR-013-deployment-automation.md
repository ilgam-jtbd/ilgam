# ADR-013 · 배포 자동화 + 도메인 연결 + Edge Function 일괄 배포

- **상태**: Accepted
- **일자**: 2026-04-29
- **관련**: docs/runbook/domain_setup.md, .github/workflows/deploy.yml, scripts/

## 결정

ILGAM 베타(Phase 0 검증)부터 production 배포는 5축 자동화로 운영:

1. **도메인 연결**: Cloudflare(DNS·만료 갱신) + Vercel(SSL·CDN)
2. **배포 트리거**: `git push origin main` → GitHub Actions deploy.yml
3. **검증 자동화**: 배포 후 healthz + DNS + SSL 자동 검사
4. **Edge Function 일괄**: `scripts/deploy_edge_functions.sh` 6개 배치
5. **회복 자동화**: Vercel Promote (RTO 30초) + Supabase PITR (RPO 1분)

## 수동 1회 작업 (사용자 단계, runbook 따라)

- Vercel 프로젝트 import (5분)
- Supabase 프로덕션 + 마이그레이션 (10분)
- 시크릿 14종 등록
- Cloudflare DNS A·CNAME (1~5분 propagation)

## 자동화 범위

### .github/workflows/deploy.yml
- main push 시 자동 실행
- pnpm lint·typecheck → Vercel CLI prod deploy → healthz 검증 → Slack 통보

### scripts/deploy_edge_functions.sh
- 6 함수 배치 (qa-classifier·match-engine·notify-dispatch·payment-settle·cx-triage·healthz)

### scripts/verify_deployment.sh
- DNS 전파 + SSL 인증서 + healthz + Supabase REST 5축 검증

## 비용·SLA

- Vercel Pro $20 + Cloudflare Free + Supabase Pro $25 = 월 약 7만원 (M3+)
- M0~M2: Vercel Hobby + Supabase Free = 0원
- SLA 합산 99.89% (월 47분 다운타임 허용)

## 후속 액션

- M0 (2026.10): 도메인 연결 + first prod deploy
- M3 (2027.01): Sentry · PostHog · Uptime Kuma 활성
- M6 (2027.04): PortOne 라이브 키 활성 (10% 수수료 시작)
- M9: load testing + Vercel Edge 체험
- M12: 백업·DR 시뮬레이션 분기 1회

## 변경 이력
- 2026-04-29 v1.0: 신규 작성
