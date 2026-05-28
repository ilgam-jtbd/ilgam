#!/usr/bin/env bash
# migrate-to-velor-repo.sh — ilgam-jtbd/ilgam → ilgam-jtbd/velor 최종 이전
# 사전 조건:
#   1. ilgam-jtbd/velor 리포가 GitHub에 생성되어 있어야 함
#   2. 현재 브랜치의 모든 변경사항이 커밋된 상태
#   3. pnpm turbo lint typecheck test 통과 상태
set -euo pipefail

TARGET_REMOTE="https://github.com/ilgam-jtbd/velor.git"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

cyan() { echo -e "\033[36m$*\033[0m"; }
green() { echo -e "\033[32m$*\033[0m"; }
red() { echo -e "\033[31m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }

cyan "================================================"
cyan " VELOR 리포 최종 이전 스크립트"
cyan " Source : ilgam-jtbd/ilgam ($CURRENT_BRANCH)"
cyan " Target : ilgam-jtbd/velor (main)"
cyan "================================================"

# ─── 사전 검증 ──────────────────────────────────────────────
cyan "[1/5] 사전 검증"

if [ -n "$(git status --porcelain)" ]; then
  red "ERROR: 미커밋 변경사항이 있습니다. 먼저 commit하세요."
  git status --short
  exit 1
fi
green "  [OK] working tree clean"

cyan "[2/5] lint + typecheck 최종 확인"
pnpm turbo lint typecheck 2>&1 | tail -5
green "  [OK] lint + typecheck 통과"

# ─── 대상 리모트 추가 ────────────────────────────────────────
cyan "[3/5] velor 리모트 추가"
if git remote | grep -q "^velor$"; then
  yellow "  velor 리모트 이미 존재 — 스킵"
else
  git remote add velor "$TARGET_REMOTE"
  green "  [OK] velor 리모트 추가됨"
fi

# ─── main 브랜치로 푸시 ─────────────────────────────────────
cyan "[4/5] ilgam-jtbd/velor main 으로 푸시"
git push velor "$CURRENT_BRANCH:main" --force-with-lease 2>&1 || {
  red "  push 실패 — ilgam-jtbd/velor 리포가 존재하는지 확인하세요"
  yellow "  https://github.com/ilgam-jtbd/velor 에서 리포 생성 후 재시도"
  exit 1
}
green "  [OK] ilgam-jtbd/velor main 푸시 완료"

# ─── 완료 ───────────────────────────────────────────────────
cyan "[5/5] 완료"
green "================================================"
green " 이전 완료!"
green " 확인: https://github.com/ilgam-jtbd/velor"
green ""
green " 다음 단계:"
green " 1. GitHub 리포 Description, Topics 업데이트"
green " 2. Vercel 프로젝트를 ilgam-jtbd/velor 로 재연결"
green " 3. bash scripts/verify_deployment.sh velor.kr"
green "================================================"
