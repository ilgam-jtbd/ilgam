#!/usr/bin/env bash
# 일감 로컬 개발환경 부트스트랩
set -euo pipefail

echo "[1/4] Node.js 버전 확인..."
node -v | grep -qE "^v(20|21|22)" || { echo "Node 20+ 필요"; exit 1; }

echo "[2/4] pnpm 설치 확인..."
command -v pnpm >/dev/null 2>&1 || npm i -g pnpm@9.12.0

echo "[3/4] 의존성 설치..."
pnpm install --frozen-lockfile || pnpm install

echo "[4/4] 환경변수 체크..."
[ -f .env ] || { cp .env.example .env; echo ".env 생성됨 — 값을 채워주세요"; }

echo "✓ 부트스트랩 완료"
echo "다음 명령으로 시작:"
echo "  pnpm dev:web   # 구인자 어드민 (http://localhost:3000)"
echo "  pnpm dev:app   # 시니어 워커 앱"
echo "  pnpm db:migrate"
