#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-artifacts/phase11/hypercare}"
API_BASE_URL="${API_BASE_URL:-https://api-staging.jfav.cloud}"
WEB_BASE_URL="${WEB_BASE_URL:-https://staging.jfav.cloud}"
ALLOW_INSECURE_TLS="${ALLOW_INSECURE_TLS:-true}"

mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
REPORT="$OUT_DIR/hypercare-$STAMP.md"

CURL_FLAGS=(-sS)
if [ "$ALLOW_INSECURE_TLS" = "true" ]; then
  CURL_FLAGS+=(-k)
fi

health_status="unknown"
web_status="unknown"
api_headers_file="$OUT_DIR/api-headers-$STAMP.txt"
web_headers_file="$OUT_DIR/web-headers-$STAMP.txt"

if curl "${CURL_FLAGS[@]}" -I "$API_BASE_URL/health/live" >"$api_headers_file" 2>/dev/null; then
  health_status="ok"
else
  health_status="failed"
fi

if curl "${CURL_FLAGS[@]}" -I "$WEB_BASE_URL" >"$web_headers_file" 2>/dev/null; then
  web_status="ok"
else
  web_status="failed"
fi

cat > "$REPORT" <<MD
# Hypercare Daily Snapshot

- timestamp_utc: $STAMP
- api_base_url: $API_BASE_URL
- web_base_url: $WEB_BASE_URL
- api_health_probe: $health_status
- web_probe: $web_status

## Notes
- Generated automatically by scripts/phase11/collect-daily-hypercare.sh
- Use together with ops-scheduled-validation workflow outcomes.
MD

echo "[phase11] wrote $REPORT"
