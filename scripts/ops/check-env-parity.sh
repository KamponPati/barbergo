#!/usr/bin/env bash
set -euo pipefail

# Validate staging/prod env key parity and required keys.

STAGING_FILE="${STAGING_FILE:-/etc/barbergo/staging.env}"
PRODUCTION_FILE="${PRODUCTION_FILE:-/etc/barbergo/production.env}"

required_keys=(
  NODE_ENV
  PORT
  DATABASE_URL
  REDIS_URL
  JWT_SECRET
  AUTH_COOKIE_SECURE
  IDEMPOTENCY_TTL_SECONDS
  MINIO_ENDPOINT
  MINIO_PORT
  MINIO_USE_SSL
  MINIO_ACCESS_KEY
  MINIO_SECRET_KEY
  MINIO_BUCKET
  MINIO_SIGNED_URL_EXPIRY_SECONDS
  PAYMENT_PROVIDER_URL
  PAYMENT_PROVIDER_FALLBACK_URL
  PAYMENT_PROVIDER_API_KEY
  PAYMENT_PROVIDER_WEBHOOK_SECRET
  PAYMENT_PROVIDER_TIMEOUT_MS
  PAYMENT_PROVIDER_MAX_RETRIES
  PAYMENT_PROVIDER_CIRCUIT_FAILURE_THRESHOLD
  PAYMENT_PROVIDER_CIRCUIT_COOLDOWN_MS
  PUSH_PROVIDER_URL
  PUSH_PROVIDER_FALLBACK_URL
  PUSH_PROVIDER_API_KEY
  PUSH_PROVIDER_TIMEOUT_MS
  PUSH_PROVIDER_MAX_RETRIES
  PUSH_PROVIDER_CIRCUIT_FAILURE_THRESHOLD
  PUSH_PROVIDER_CIRCUIT_COOLDOWN_MS
)

extract_keys() {
  local f="$1"
  if [ ! -f "$f" ]; then
    echo "[FAIL] missing env file: $f" >&2
    return 1
  fi
  rg -n '^[A-Za-z_][A-Za-z0-9_]*=' "$f" -o -r '$0' | sed 's/=.*$//' | sort -u
}

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

extract_keys "$STAGING_FILE" >"$tmp_dir/staging.keys"
extract_keys "$PRODUCTION_FILE" >"$tmp_dir/production.keys"

echo "[INFO] comparing key sets"
if ! diff -u "$tmp_dir/staging.keys" "$tmp_dir/production.keys"; then
  echo "[FAIL] staging/production env key sets are different" >&2
  exit 1
fi

echo "[INFO] checking required keys"
for key in "${required_keys[@]}"; do
  if ! rg -q "^${key}=" "$STAGING_FILE"; then
    echo "[FAIL] missing key in staging: $key" >&2
    exit 1
  fi
  if ! rg -q "^${key}=" "$PRODUCTION_FILE"; then
    echo "[FAIL] missing key in production: $key" >&2
    exit 1
  fi
done

echo "[SUCCESS] env parity check passed"

