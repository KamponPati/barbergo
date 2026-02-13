#!/usr/bin/env bash
set -euo pipefail

if ! command -v k6 >/dev/null 2>&1; then
  echo "[ERROR] k6 not installed. Install from https://k6.io/docs/get-started/installation/"
  exit 1
fi

API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
VUS="${VUS:-20}"
DURATION="${DURATION:-30s}"

echo "[INFO] running k6 smoke with API_BASE_URL=$API_BASE_URL VUS=$VUS DURATION=$DURATION"
k6 run -e API_BASE_URL="$API_BASE_URL" -e VUS="$VUS" -e DURATION="$DURATION" scripts/perf/k6-smoke.js
