#!/usr/bin/env bash
# deploy_edge_functions.sh — 6 Edge Function 일괄 배포
set -uo pipefail
PROJECT_REF="${1:-}"
[ -z "$PROJECT_REF" ] && { echo "Usage: $0 <supabase-project-ref>"; exit 1; }
[ -z "${SUPABASE_ACCESS_TOKEN:-}" ] && { echo "ERROR: SUPABASE_ACCESS_TOKEN not set"; exit 1; }

FUNCTIONS=(qa-classifier match-engine notify-dispatch payment-settle cx-triage healthz)
FAILED=()

cyan(){ echo -e "\033[36m$*\033[0m"; }
green(){ echo -e "\033[32m$*\033[0m"; }
red(){ echo -e "\033[31m$*\033[0m"; }

cyan "============================================"
cyan " Edge Function Batch Deploy ($PROJECT_REF)"
cyan "============================================"

for fn in "${FUNCTIONS[@]}"; do
  cyan "[$fn] deploying..."
  if [ ! -d "supabase/functions/$fn" ]; then
    red "  [SKIP] not found"; FAILED+=("$fn:not-found"); continue
  fi
  if npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --no-verify-jwt 2>&1; then
    green "  [OK]"
  else
    red "  [FAIL]"; FAILED+=("$fn")
  fi
done

cyan "============================================"
[ ${#FAILED[@]} -eq 0 ] && { green " All ${#FUNCTIONS[@]} deployed"; exit 0; } || { red " FAILED: ${FAILED[*]}"; exit 1; }
