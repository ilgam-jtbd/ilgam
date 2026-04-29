# 도메인 연결 가이드 (사용자 1단계 작업)

ADR-012 H11. 도메인 발급 후 이 문서대로 1회만 진행하면 ILGAM 베타가 즉시 외부 접근 가능.

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
   - Install Command: (auto)
4. **Environment Variables** (이 단계는 추후 secrets.md 진행 후):
   - 일단 Deploy 클릭 — 첫 빌드는 Demo Mode로 동작 (NEXT_PUBLIC_DEMO_MODE=1 설정 시)

## 단계 2 — Supabase 프로젝트 + 마이그레이션

1. https://supabase.com/dashboard → New Project
   - Region: **Northeast Asia (Seoul)** ap-northeast-2
   - DB password: 1Password에 저장
2. Settings → API → 3개 키 복사 (1Password 저장):
   - URL · anon · service_role
3. 로컬 터미널에서:
   ```bash
   cd ilgam-code
   npx supabase login
   npx supabase link --project-ref <YOUR_REF>
   npx supabase db push   # 0001~0006 마이그레이션 적용
   ```
4. **Edge Functions 배포**:
   ```bash
   for fn in qa-classifier match-engine notify-dispatch payment-settle cx-triage healthz; do
     npx supabase functions deploy $fn --no-verify-jwt
   done
   ```

## 단계 3 — 시크릿 등록 (14종)

`docs/runbook/secrets.md` 인벤토리 따라:

### Vercel Environment Variables
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Production scope에:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (service_role)
   - `NEXT_PUBLIC_SITE_URL` = `https://ilgam.kr`
   - `NEXT_PUBLIC_DEMO_MODE` = `0` (필수! prod에서 1이면 build throw)
   - `NEXT_PUBLIC_SENTRY_DSN` = (Sentry 가입 후)
3. Preview scope에는 `NEXT_PUBLIC_DEMO_MODE=1` 가능 (KORDI 데모용)

### GitHub Repository Secrets
GitHub → Settings → Secrets and variables → Actions:
- `VERCEL_TOKEN` (https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` (Vercel Team Settings)
- `VERCEL_PROJECT_ID` (Vercel 프로젝트 Settings)
- `SUPABASE_ACCESS_TOKEN` (https://supabase.com/dashboard/account/tokens)
- `SUPABASE_PROJECT_REF` (프로젝트 ID)
- `SLACK_WEBHOOK_DEPLOYS` (Slack #ops 채널)

### Supabase Edge Function Vault
Supabase Dashboard → Edge Functions → Manage Secrets:
- `ANTHROPIC_API_KEY` (https://console.anthropic.com/settings/keys)
- `BIZPPURIO_API_KEY` (Bizppurio 콘솔)
- `ALIGO_API_KEY` (Aligo SMS)
- `SENTRY_DSN` (Edge Functions용)
- `DEPLOY_SHA` (auto from CI)

PortOne 키는 M6 (2027-05) 직전 활성.

## 단계 4 — 도메인 연결

### Vercel Domains
1. Vercel Dashboard → Project → Settings → **Domains**
2. `ilgam.kr` 추가 (또는 `www.ilgam.kr`)
3. Vercel이 보여주는 DNS 레코드 복사:
   - A 레코드: `76.76.21.21`
   - 또는 CNAME: `cname.vercel-dns.com`

### Cloudflare DNS (도메인 제공자)
1. Cloudflare Dashboard → 해당 도메인 → DNS → Records
2. 추가:
   - Type: A · Name: `@` · Content: `76.76.21.21` · Proxy: **Off** (Vercel SSL 충돌)
   - Type: CNAME · Name: `www` · Content: `cname.vercel-dns.com` · Proxy: Off
3. SSL/TLS → **Full (strict)** 설정
4. 1~5분 후 https://ilgam.kr 접속 → Vercel 페이지 로드 확인

### 검증
```bash
curl -I https://ilgam.kr           # 200 OK
curl https://ilgam.kr/api/healthz  # {"ok":true,"sha":"..."}
```

SSL Labs (https://www.ssllabs.com/ssltest/) → A+ 등급 확인.

## 단계 5 — GitHub Pages 쇼케이스 도메인 연결 (선택)

쇼케이스를 `showcase.ilgam.kr`로:
1. Cloudflare DNS → CNAME `showcase` → `ilgam-jtbd.github.io`
2. GitHub → ilgam-showcase repo → Settings → Pages → Custom domain: `showcase.ilgam.kr`
3. HTTPS Enforce on

## 자동화 — 이후 배포는 push만

도메인 연결 후 첫 push 시 GitHub Actions deploy.yml 자동 실행:
- `git push origin main` → CI → Vercel prod deploy → healthz 검증 → Slack 통보

## 사고 시 회복

- Vercel Dashboard → Deployments → 이전 deployment → **Promote to Production** (RTO 30초)
- 또는 `vercel rollback` (CLI)
- DB 마이그 revert: `npx supabase db reset --linked --to <timestamp>` (RPO 1분, PITR)

## 도메인 만료 알람

Cloudflare Auto-renew On + 만료 30일 전 이메일 자동 발송. 1Password 자동 만료 추적.
