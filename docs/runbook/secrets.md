# 시크릿 인벤토리 (1Password Vault: ILGAM-Production)

ADR-006 + ADR-012 H3. **모든 시크릿은 1Password Business → GitHub Secrets / Vercel Env / Supabase Vault / EAS Secrets 에 미러링.** 절대 .env 커밋 금지 (pre-commit 차단).

## 인벤토리 — 14건

### 핵심 인프라 (필수, M0 직전)

| # | 키 | 위치 | 발급처 | 회전 주기 |
|---|---|---|---|---|
| 1 | `SUPABASE_URL` | Vercel env (NEXT_PUBLIC_) + GH Secrets | https://supabase.com/dashboard | 비변경 (프로젝트 식별자) |
| 2 | `SUPABASE_ANON_KEY` | Vercel env (NEXT_PUBLIC_) + GH Secrets | Supabase Dashboard → Settings → API | 비변경 |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (server only) + Supabase Edge Vault | Supabase Dashboard → Settings → API | 90일 |
| 4 | `SUPABASE_ACCESS_TOKEN` | GH Secrets (CI 마이그용) | https://supabase.com/dashboard/account/tokens | 90일 |
| 5 | `SUPABASE_PROJECT_REF` | GH Secrets | Supabase 프로젝트 ID | 비변경 |
| 6 | `VERCEL_TOKEN` | GH Secrets | https://vercel.com/account/tokens | 90일 |
| 7 | `VERCEL_ORG_ID` | GH Secrets | Vercel Team Settings | 비변경 |
| 8 | `VERCEL_PROJECT_ID` | GH Secrets | Vercel 프로젝트 Settings | 비변경 |

### AI · 알림 · 결제

| # | 키 | 위치 | 발급처 | 회전 |
|---|---|---|---|---|
| 9 | `ANTHROPIC_API_KEY` | Supabase Edge Vault | https://console.anthropic.com/settings/keys | 90일 |
| 10 | `BIZPPURIO_API_KEY` | Supabase Edge Vault | Bizppurio 콘솔 | 180일 |
| 11 | `ALIGO_API_KEY` | Supabase Edge Vault | Aligo 콘솔 (SMS 폴백) | 180일 |
| 12 | `PORTONE_API_KEY` | M6+ 활성. Supabase Edge Vault | PortOne 콘솔 | 90일 |
| 13 | `PORTONE_WEBHOOK_SECRET` | M6+ 활성. Supabase Edge Vault | PortOne webhook 설정 | 180일 |

### 관측

| # | 키 | 위치 | 발급처 | 회전 |
|---|---|---|---|---|
| 14 | `SENTRY_DSN` | Vercel env (NEXT_PUBLIC_) + Edge Vault | https://sentry.io/settings/projects | 비변경 |
| 14a | `SLACK_WEBHOOK_DEPLOYS` | GH Secrets | Slack #ops 채널 webhook | 비변경 |
| 14b | `POSTHOG_API_KEY` | Vercel env (NEXT_PUBLIC_) | PostHog | 비변경 |

## 도메인 연결 (사용자 작업, 1단계)

도메인 발급 후 1회만:
1. Vercel 프로젝트 → Settings → Domains → 도메인 추가 (예: `ilgam.kr`)
2. Cloudflare DNS → A/AAAA → Vercel 76.76.21.21 (또는 CNAME `cname.vercel-dns.com`)
3. TLS 자동 발급 (Vercel · 1~5분)
4. Health check: `curl https://ilgam.kr/api/healthz` → 200 OK
5. SSL Labs 검증 → A+ 등급 확인

도메인 만료 30일 전 자동 알림 (Cloudflare).

## 로컬 개발 (.env 패턴)

`.env.example` → `.env` 복사 후 1Password Vault에서 값 동기. 절대 `git add .env` 금지 (.gitignore 등록 + pre-commit secretlint).

## 사고 대응 (시크릿 노출 시)

1. 즉시 1Password Vault 회전 (해당 키)
2. 모든 4 위치 (GH·Vercel·Supabase·EAS) 동시 갱신
3. 노출 git history → BFG Repo-Cleaner
4. `operator_actions` audit 검색 → 노출 윈도 동안 비정상 액세스 확인
5. 인시던트 P0 runbook 발동 (`docs/runbook/incident-P0.md`)
