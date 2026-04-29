# 배포 런북 · 일감 (ILGAM)

> 단일 소스 · MVP 초도 배포 (admin-web → Vercel, Supabase → ap-northeast-2, worker-app → EAS preview)

## 전제

- Supabase 유료 조직 (ap-northeast-2 / 서울)
- Vercel 계정 (Hobby 또는 Pro)
- 로컬: `pnpm ≥ 9`, `supabase CLI ≥ 1.180`, `vercel CLI ≥ 34`
- 토큰 2개: **Supabase Access Token**, **Vercel Token**

## 1. Supabase 프로젝트 부트스트랩

```bash
# 로그인
export SUPABASE_ACCESS_TOKEN="sbp_xxx"

# 프로젝트 생성 (서울 리전, Postgres 15)
supabase projects create ilgam-prod \
  --org-id <your_org_id> \
  --region ap-northeast-2 \
  --db-password "$(openssl rand -base64 32)"

# 프로젝트 ref 메모 (abcdefghij...) → 이후 PROJECT_REF 로 사용
export PROJECT_REF=<ref>

# 원격 link
supabase link --project-ref "$PROJECT_REF"

# 마이그레이션 적용 (순서 중요)
for f in packages/db/migrations/*.sql; do
  psql "$(supabase db url)" -f "$f"
done

# 확장 (pgTAP 은 CI 전용 · 프로덕션 불필요)
psql "$(supabase db url)" -c "select extname from pg_extension;"

# 시드
psql "$(supabase db url)" -f packages/db/seeds/dev/001_regions.sql
psql "$(supabase db url)" -f packages/db/seeds/dev/002_employers_jobs.sql

# Edge Functions 배포
supabase functions deploy match-engine --project-ref "$PROJECT_REF"
supabase functions deploy notify-dispatch --project-ref "$PROJECT_REF" --no-verify-jwt
supabase functions deploy payment-settle --project-ref "$PROJECT_REF" --no-verify-jwt
supabase functions deploy cx-triage --project-ref "$PROJECT_REF"

# Edge Functions 환경변수 (Supabase Dashboard → Functions → Secrets)
supabase secrets set --project-ref "$PROJECT_REF" \
  BIZPPURIO_ACCOUNT_ID=xxx \
  BIZPPURIO_API_KEY=xxx \
  BIZPPURIO_SENDER_KEY=xxx \
  BIZPPURIO_SENDER_NUMBER=02xxxxxxxx \
  ALIGO_API_KEY=xxx \
  ALIGO_USER_ID=xxx \
  ALIGO_SENDER_NUMBER=02xxxxxxxx \
  ALIGO_TESTMODE=1 \
  PORTONE_WEBHOOK_SECRET=whsec_xxx \
  SLACK_WEBHOOK_URL_P0=https://hooks.slack.com/...
```

출력에서 아래 3개 값을 꺼내 Vercel 에 주입할 준비:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<PROJECT_REF>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase Dashboard → Settings → API → `anon public`
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase Dashboard → Settings → API → `service_role` (⚠️ 절대 클라이언트 노출 금지)

## 2. Vercel 배포 (admin-web)

```bash
export VERCEL_TOKEN="xxx"

cd apps/admin-web

# 프로젝트 링크 (최초 1회)
vercel link --yes \
  --project ilgam-admin-web \
  --scope <team_or_personal> \
  --token "$VERCEL_TOKEN"

# 환경변수 주입 (Preview + Production)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://$PROJECT_REF.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SERVICE_ROLE_KEY"
vercel env add ANTHROPIC_API_KEY production <<< "$ANTHROPIC_API_KEY"

# 빌드 명령은 Vercel 이 turbo + pnpm 자동 감지 → 루트 수준 vercel.json 이 지정
vercel deploy --prod --token "$VERCEL_TOKEN"
```

배포 완료 후 URL:
- Production: `https://ilgam-admin-web.vercel.app` (또는 커스텀 도메인)
- Preview: PR 별 `https://ilgam-admin-web-git-<branch>-<scope>.vercel.app`

## 3. Supabase Auth redirect URL 추가

Magic Link 가 Vercel 도메인으로 돌아오려면 Supabase Dashboard → Authentication → URL Configuration 에 다음 추가:

- Site URL: `https://ilgam-admin-web.vercel.app`
- Redirect URLs:
  - `https://ilgam-admin-web.vercel.app/auth/callback`
  - `https://*-<scope>.vercel.app/auth/callback` (프리뷰 도메인)
  - `http://localhost:3000/auth/callback` (로컬 개발)

## 4. PortOne 웹훅 등록

PortOne 콘솔 → 결제 연동 → 웹훅 추가:

- URL: `https://<PROJECT_REF>.supabase.co/functions/v1/payment-settle`
- 이벤트: `Transaction.Paid`, `Transaction.Failed`, `Transaction.Cancelled`
- 시크릿: 앞서 `PORTONE_WEBHOOK_SECRET` 에 주입한 값

## 5. worker-app EAS 프리뷰 (선택)

```bash
cd apps/worker-app
npx eas-cli@latest init  # projectId 발급
npx eas-cli@latest build --profile preview --platform android
# APK URL 이 나오면 테스트 단말에 설치
```

## 6. 스모크 체크리스트

배포 직후 반드시 확인:

- [ ] `https://<vercel-url>/` — 마케팅 페이지 + 로고 렌더
- [ ] `/auth/login` — 이메일 입력 후 Magic Link 수신
- [ ] `/auth/callback?code=...` — 로그인 후 `/dashboard` 리디렉션
- [ ] `/internal` 접근 — 비-관리자는 404, 관리자 MFA 미등록 시 `/internal/mfa-setup` 리디렉션
- [ ] Supabase Dashboard → Table Editor → `jobs` — 시드 6건 보임
- [ ] `curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/payment-settle -H "x-portone-signature: t=0,v1=deadbeef"` → 401 (서명 검증 동작)

## 7. 롤백

- **admin-web**: Vercel Dashboard → Deployments → 이전 성공 배포 "Promote to Production"
- **DB 마이그레이션**: 현재는 append-only. 문제 발생 시 별도 역방향 migration 추가 (destructive 작업은 사전 ADR 리뷰 필수)
- **Edge Function**: `supabase functions deploy <name> --project-ref $PROJECT_REF --import-map old-version.json` 또는 Git SHA 체크아웃 후 재배포

## 부록 · 자주 막히는 포인트

- Next.js `metadataBase` 가 `https://ilgam.kr` 인데 Vercel 기본 도메인은 다름 → 배포 후 `apps/admin-web/app/layout.tsx` 의 `metadataBase` 를 실제 도메인으로 교체 또는 `process.env.VERCEL_URL` 사용
- Supabase Edge Function 이 `verify_jwt=false` 면 CLI 플래그 `--no-verify-jwt` 반드시 지정
- pgTAP 은 프로덕션 DB 에 설치하지 말 것 (CI 전용) — 이미 0001 에서 create extension 안 함
