#!/usr/bin/env bash
# deploy-platform-web.sh — platform-web Vercel 배포 자동화
# 사용법: VERCEL_TOKEN=xxx SUPABASE_ANON_KEY=xxx bash scripts/deploy-platform-web.sh [--prod]
set -euo pipefail

PROD_FLAG=""
[ "${1:-}" = "--prod" ] && PROD_FLAG="--prod"

cyan() { echo -e "\033[36m$*\033[0m"; }
green() { echo -e "\033[32m$*\033[0m"; }
red() { echo -e "\033[31m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }

cyan "================================================"
cyan " VELOR platform-web Vercel 배포"
cyan "================================================"

# ─── 필수 변수 체크 ──────────────────────────────────────────
[ -z "${VERCEL_TOKEN:-}" ] && {
  red "ERROR: VERCEL_TOKEN 미설정"
  echo "  → Vercel 대시보드 > Settings > Tokens 에서 생성 후"
  echo "    export VERCEL_TOKEN=<token>"
  exit 1
}

[ -z "${SUPABASE_ANON_KEY:-}" ] && {
  red "ERROR: SUPABASE_ANON_KEY 미설정"
  echo "  → 1Password > ILGAM Vault > Supabase anon key"
  echo "    export SUPABASE_ANON_KEY=<key>"
  exit 1
}

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://izeotpefhddrrwodgpry.supabase.co}"
VWO_ID="${NEXT_PUBLIC_VWO_ACCOUNT_ID:-}"
POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY:-}"
APP_DIR="apps/platform-web"

# ─── 1. pnpm 빌드 검증 ───────────────────────────────────────
cyan "[1/4] 빌드 검증 (typecheck + lint)"
pnpm turbo lint typecheck --filter=@ilgam/platform-web
green "  [OK] lint + typecheck 통과"

# ─── 2. Vercel 프로젝트 링크 ─────────────────────────────────
cyan "[2/4] Vercel 프로젝트 링크"
cd "$APP_DIR"

if [ ! -f ".vercel/project.json" ]; then
  yellow "  .vercel/project.json 없음 — 신규 프로젝트로 초기화"
  npx vercel link --yes --token="$VERCEL_TOKEN" 2>&1 || {
    yellow "  대화형 링크 필요 — Vercel 대시보드에서 수동 연결 후 재시도"
    yellow "  1. vercel.com/new → Import Git Repository"
    yellow "  2. Root Directory: apps/platform-web"
    yellow "  3. Framework: Next.js"
    exit 0
  }
else
  green "  [OK] .vercel/project.json 존재"
fi

# ─── 3. 환경변수 설정 ────────────────────────────────────────
cyan "[3/4] Vercel 환경변수 설정"

set_env() {
  local key="$1" val="$2" envs="${3:-production preview development}"
  if [ -z "$val" ]; then
    yellow "  [SKIP] $key (값 없음)"
    return
  fi
  echo "$val" | npx vercel env add "$key" production --token="$VERCEL_TOKEN" --force 2>/dev/null || true
  echo "$val" | npx vercel env add "$key" preview --token="$VERCEL_TOKEN" --force 2>/dev/null || true
  green "  [OK] $key 설정됨"
}

set_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
set_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
[ -n "$VWO_ID" ] && set_env "NEXT_PUBLIC_VWO_ACCOUNT_ID" "$VWO_ID"
[ -n "$POSTHOG_KEY" ] && set_env "NEXT_PUBLIC_POSTHOG_KEY" "$POSTHOG_KEY"

# ─── 4. 배포 ────────────────────────────────────────────────
cyan "[4/4] Vercel 배포 ${PROD_FLAG:+(프로덕션)}"

DEPLOY_OUTPUT=$(npx vercel deploy $PROD_FLAG --token="$VERCEL_TOKEN" --yes 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "^https://" | tail -1)

green "================================================"
green " 배포 완료!"
green " URL: $DEPLOY_URL"
green "================================================"

cd ../..

# ─── 5. 헬스체크 ────────────────────────────────────────────
if [ -n "$DEPLOY_URL" ]; then
  cyan "[검증] /api/healthz"
  sleep 5
  HEALTH=$(curl -s "$DEPLOY_URL/api/healthz" 2>/dev/null || echo '{"ok":false}')
  echo "$HEALTH" | grep -q '"ok":true' && green "  [OK] $HEALTH" || yellow "  [WARN] $HEALTH (배포 완료까지 30초 대기 후 재확인)"
fi
