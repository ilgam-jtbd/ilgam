# 도메인 연결 가이드 (사용자 1단계 작업)

**ADR-013 H1**. 도메인 발급 후 본 문서대로 1회만 진행하면 ILGAM 베타가 즉시 외부 접근 가능.

## 사전 준비 (1회)

| # | 항목 | 발급처 | 예상 소요 |
|---|---|---|---|
| 1 | 도메인 (예: `ilgam.kr`) | 가비아·후이즈·Cloudflare Registrar | 즉시~24h |
| 2 | Vercel 계정 | https://vercel.com/signup (GitHub OAuth) | 5분 |
| 3 | Cloudflare 계정 | https://dash.cloudflare.com/sign-up | 5분 |
| 4 | Supabase 프로젝트 (Production) | https://supabase.com/dashboard → New Project (Region: ap-northeast-2 Seoul) | 10분 |

## 단계 1 — Vercel 프로젝트 생성

1. https://vercel.com/new 접속
2. **Import Git Repository** → `ilgam-jtbd/ilgam` 선택 (GitHub OAuth 권한 부여)
3. **Configure Project**:
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `apps/admin-web`
   - Build Command: (auto, vercel.json 사용)
4. 일단 Deploy 클릭 — 첫 빌드는 Demo Mode (`NEXT_PUBLIC_DEMO_MODE=1`)

## 단계 2 — Supabase 프로젝트 + 마이그레이션

1. https://supabase.com/dashboard → New Project
   - Region: **Northeast Asia (Seoul)** ap-northeast-2
   - DB password: 1Password 저장
2. Settings → API → 3개 키 복사 (1Password 저장):
   - URL · anon · service_role
3. 로컬 터미널:
   ```bash
   cd ilgam-code
   npx supabase login
   npx supabase link --project-ref <YOUR_REF>
   npx supabase db push   # 0001~0006 마이그레이션
   ```
4. Edge Functions 일괄 배포:
   ```bash
   bash scripts/deploy_edge_functions.sh <YOUR_REF>
   ```

## 단계 3 — 시크릿 등록 (14종)

상세 인벤토리: `docs/runbook/secrets.md`

### Vercel Environment Variables (6)
- `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL = https://ilgam.kr` · `NEXT_PUBLIC_DEMO_MODE = 0`
- `NEXT_PUBLIC_SENTRY_DSN` (Sentry 가입 후)

### GitHub Actions Secrets (6)
- `VERCEL_TOKEN` · `VERCEL_ORG_ID` · `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN` · `SUPABASE_PROJECT_REF` · `SLACK_WEBHOOK_DEPLOYS`

### Supabase Edge Function Vault (5)
- `ANTHROPIC_API_KEY` · `BIZPPURIO_API_KEY` · `ALIGO_API_KEY` · `SENTRY_DSN` · `DEPLOY_SHA`

PortOne 키는 M6 (2027-05) 직전 활성.

## 단계 4 — 도메인 연결

### Vercel Domains
1. Vercel Dashboard → Project → Settings → **Domains**
2. `ilgam.kr` 추가 → DNS 레코드 복사 (A: `76.76.21.21` 또는 CNAME: `cname.vercel-dns.com`)

### Cloudflare DNS
1. DNS → Records 추가:
   - Type: A · Name: `@` · Content: `76.76.21.21` · Proxy: **Off**
   - Type: CNAME · Name: `www` · Content: `cname.vercel-dns.com` · Proxy: Off
2. SSL/TLS → **Full (strict)**
3. 1~5분 후 https://ilgam.kr 접속 확인

### 검증
```bash
bash scripts/verify_deployment.sh ilgam.kr
```

## 단계 5 — GitHub Pages 쇼케이스 (선택)

1. Cloudflare DNS → CNAME `showcase` → `ilgam-jtbd.github.io`
2. GitHub → ilgam-showcase → Settings → Pages → Custom domain: `showcase.ilgam.kr`
3. HTTPS Enforce on

## 자동화 — 이후 배포는 push만

- `git push origin main` → `.github/workflows/deploy.yml` 자동 실행
- Vercel prod deploy → healthz 검증 → Slack 통보

## 사고 시 회복

- Vercel Dashboard → Deployments → Promote to Production (RTO 30초)
- `vercel rollback` (CLI)
- DB: `npx supabase db reset --linked --to <timestamp>` (RPO 1분, PITR)

## 도메인 만료 알람

Cloudflare Auto-renew On + 만료 30일 전 이메일 + 1Password 자동 추적
