#!/usr/bin/env bash
# 외부 백업용 단일 tar.gz 생성
set -euo pipefail
TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT="ilgam-${TS}.tar.gz"
tar --exclude='node_modules' --exclude='.next' --exclude='.turbo' --exclude='.expo' \
    --exclude='dist' --exclude='build' \
    -czf "$OUT" .
echo "✓ Created $OUT"
ls -lh "$OUT"
