# 시크릿 인벤토리 (14종)

**ADR-013 보조**. 도메인 연결 시 등록할 시크릿 + 출처·저장소·로테이션.

## 분류

| 저장소 | 개수 | 용도 |
|---|---|---|
| Vercel Env Vars | 6 | Next.js 런타임 |
| GitHub Actions Secrets | 6 | CI/CD 배포 |
| Supabase Edge Function Vault | 5 | Edge Function 런타임 |
| 1Password (SSOT) | 14 | 모든 비밀의 단일 진실 원천 |

## Vercel Environment Variables (6)

| 키 | 출처 | scope | 회전 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings > API | Production·Preview | 변경 없음 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings > API | Production·Preview | 분기 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings > API | Production만 | 분기 |
| `NEXT_PUBLIC_SITE_URL` | `https://ilgam.kr` Prod / `https://*.vercel.app` Preview | scope별 | 변경 없음 |
| `NEXT_PUBLIC_DEMO_MODE` | `0` Prod / `1` Preview | scope별 | 변경 없음 |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry 가입 후 | Production·Preview | 변경 없음 |

## GitHub Actions Secrets (6)

| 키 | 발급처 | 회전 |
|---|---|---|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens | 분기 |
| `VERCEL_ORG_ID` | Vercel Team Settings | 변경 없음 |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 Settings | 변경 없음 |
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens | 분기 |
| `SUPABASE_PROJECT_REF` | Supabase 프로젝트 ID | 변경 없음 |
| `SLACK_WEBHOOK_DEPLOYS` | Slack #ops webhook | 6개월 |

## Supabase Edge Function Vault (5)

| 키 | 발급처 | 회전 |
|---|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys | 분기 |
| `BIZPPURIO_API_KEY` | Bizppurio 콘솔 | 분기 |
| `ALIGO_API_KEY` | Aligo SMS 콘솔 | 분기 |
| `SENTRY_DSN` | Sentry (Edge용) | 변경 없음 |
| `DEPLOY_SHA` | CI 자동 주입 | 매 배포 |

## M6 (2027-05) 이후 활성

- `PORTONE_API_KEY` · `PORTONE_API_SECRET` · `PORTONE_WEBHOOK_SECRET`

## 보안 원칙

1. **service_role**: Production scope만, Preview 절대 금지
2. **회전**: 직원 이탈·노출 의심·분기 정기
3. **1Password SSOT**: 모든 키는 1Password ILGAM Vault. 다른 저장소는 사본
4. **회전 절차**: 1Password 갱신 → Vercel·GitHub·Supabase 동기화 → 24h 모니터
5. **Audit**: healthz 응답에 `sha` 필드 (시크릿 동기화 검증)
