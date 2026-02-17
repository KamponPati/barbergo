#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:3000/api/v1}"
WEB_BASE_URL="${WEB_BASE_URL:-http://127.0.0.1:5173}"
REPORT_DIR="${REPORT_DIR:-./artifacts/e2e-regression}"
SMOKE_ALLOW_INSECURE_TLS="${SMOKE_ALLOW_INSECURE_TLS:-false}"

mkdir -p "$REPORT_DIR"

echo "[full-e2e] API_BASE_URL=$API_BASE_URL" | tee "$REPORT_DIR/context.log"
echo "[full-e2e] WEB_BASE_URL=$WEB_BASE_URL" | tee -a "$REPORT_DIR/context.log"

echo "[full-e2e] run api test suite" | tee "$REPORT_DIR/api-tests.log"
corepack pnpm --filter @barbergo/api test 2>&1 | tee -a "$REPORT_DIR/api-tests.log"

echo "[full-e2e] run critical smoke journey" | tee "$REPORT_DIR/smoke.log"
API_BASE_URL="$API_BASE_URL" WEB_BASE_URL="$WEB_BASE_URL" SMOKE_ALLOW_INSECURE_TLS="$SMOKE_ALLOW_INSECURE_TLS" \
  bash scripts/staging/smoke-critical-journeys.sh 2>&1 | tee -a "$REPORT_DIR/smoke.log"

echo "[full-e2e] completed successfully" | tee "$REPORT_DIR/result.log"
