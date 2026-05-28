#!/usr/bin/env bash
# verify_deployment.sh — DNS·SSL·healthz·Supabase 검증
set -euo pipefail
DOMAIN="${1:-velor.kr}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
EXIT_CODE=0

cyan(){ echo -e "\033[36m$*\033[0m"; }
green(){ echo -e "\033[32m$*\033[0m"; }
red(){ echo -e "\033[31m$*\033[0m"; }

cyan "============================================"
cyan " VELOR Deployment Verification: $DOMAIN"
cyan "============================================"

cyan "[1/5] DNS A record"
A=$(dig +short A "$DOMAIN" | head -1)
[ "$A" = "76.76.21.21" ] && green "  [OK] $A" || { red "  [FAIL] expected 76.76.21.21, got: $A"; EXIT_CODE=1; }

cyan "[2/5] SSL certificate"
if echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates; then
  green "  [OK]"
else
  red "  [FAIL] SSL handshake"; EXIT_CODE=1
fi

cyan "[3/5] HTTP 200"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")
[ "$CODE" = "200" ] && green "  [OK] $CODE" || { red "  [FAIL] $CODE"; EXIT_CODE=1; }

cyan "[4/5] /api/healthz"
H=$(curl -s "https://$DOMAIN/api/healthz")
echo "$H" | grep -q '"ok":true' && { green "  [OK]"; echo "  $H"; } || { red "  [FAIL] $H"; EXIT_CODE=1; }

cyan "[5/5] Supabase REST"
if [ -n "$SUPABASE_URL" ]; then
  C=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}")
  [ "$C" = "200" ] || [ "$C" = "401" ] && green "  [OK] $C" || { red "  [FAIL] $C"; EXIT_CODE=1; }
else
  echo "  [SKIP] NEXT_PUBLIC_SUPABASE_URL 미설정"
fi

cyan "============================================"
[ $EXIT_CODE -eq 0 ] && green " 모든 검증 PASS" || red " 일부 FAIL — 위 로그 확인"
exit $EXIT_CODE
