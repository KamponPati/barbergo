#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
WEB_BASE_URL="${WEB_BASE_URL:-http://localhost:5173}"
SMOKE_ALLOW_INSECURE_TLS="${SMOKE_ALLOW_INSECURE_TLS:-false}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# Use -f for "must succeed" requests, but do not use it for "capture http_code" requests (404/400 expected).
CURL_OK_FLAGS=(-sS -f)
CURL_ANY_FLAGS=(-sS)
if [ "$SMOKE_ALLOW_INSECURE_TLS" = "true" ]; then
  CURL_OK_FLAGS+=(-k)
  CURL_ANY_FLAGS+=(-k)
  echo "[WARN] SMOKE_ALLOW_INSECURE_TLS=true (TLS cert verification disabled)"
fi

json_get() {
  local path="$1"
  node -e '
    const fs = require("fs");
    const path = process.argv[1].split(".");
    const data = JSON.parse(fs.readFileSync(0, "utf8"));
    let cur = data;
    for (const key of path) cur = cur?.[key];
    if (cur === undefined || cur === null) process.exit(2);
    process.stdout.write(typeof cur === "object" ? JSON.stringify(cur) : String(cur));
  ' "$path"
}

post_json() {
  local url="$1"
  local payload="$2"
  local auth="${3:-}"
  local idempotency_key="smoke-$(date +%s%N)-$RANDOM"
  if [ -n "$auth" ]; then
    curl "${CURL_OK_FLAGS[@]}" \
      -H "content-type: application/json" \
      -H "authorization: Bearer $auth" \
      -H "Idempotency-Key: $idempotency_key" \
      -d "$payload" \
      "$url"
  else
    curl "${CURL_OK_FLAGS[@]}" \
      -H "content-type: application/json" \
      -H "Idempotency-Key: $idempotency_key" \
      -d "$payload" \
      "$url"
  fi
}

get_json() {
  local url="$1"
  local auth="${2:-}"
  if [ -n "$auth" ]; then
    curl "${CURL_OK_FLAGS[@]}" -H "authorization: Bearer $auth" "$url"
  else
    curl "${CURL_OK_FLAGS[@]}" "$url"
  fi
}

echo "[1/8] checking web shell"
echo "[INFO] waiting for web to become ready: $WEB_BASE_URL"
web_ok=false
for i in $(seq 1 30); do
  if curl "${CURL_OK_FLAGS[@]}" "$WEB_BASE_URL" >/dev/null 2>&1; then
    web_ok=true
    break
  fi
  sleep 1
done
if [ "$web_ok" != "true" ]; then
  echo "[FAIL] web not reachable after 30s: $WEB_BASE_URL"
  exit 1
fi

WEB_HTML="$(curl "${CURL_OK_FLAGS[@]}" "$WEB_BASE_URL")"
if ! echo "$WEB_HTML" | grep -Eq "BarberGo Web App|<div id=\"root\">"; then
  echo "[FAIL] web shell content not detected"
  exit 1
fi

echo "[2/8] customer login"
CUST_LOGIN="$(post_json "$API_BASE_URL/auth/login" '{"user_id":"cust_1","role":"customer"}')"
CUST_TOKEN="$(echo "$CUST_LOGIN" | json_get "access_token")"

echo "[3/8] customer browse -> quote -> checkout"
SHOPS="$(get_json "$API_BASE_URL/discovery/nearby?sort=rating_desc")"
SHOP_ID="$(echo "$SHOPS" | json_get "data.0.id")"
BRANCH_ID="$(echo "$SHOPS" | json_get "data.0.branches.0.id")"
SERVICE_ID="$(echo "$SHOPS" | json_get "data.0.services.0.id")"

AVAILABILITY="$(get_json "$API_BASE_URL/discovery/shops/$SHOP_ID/availability?branch_id=$BRANCH_ID&service_id=$SERVICE_ID&date=2026-02-20")"
SLOT_AT="$(echo "$AVAILABILITY" | json_get "slots.0")"

QUOTE_PAYLOAD="$(printf '{"customer_id":"cust_1","shop_id":"%s","service_id":"%s"}' "$SHOP_ID" "$SERVICE_ID")"
post_json "$API_BASE_URL/customer/bookings/quote" "$QUOTE_PAYLOAD" "$CUST_TOKEN" >/dev/null

CHECKOUT_PAYLOAD="$(printf '{"customer_id":"cust_1","shop_id":"%s","branch_id":"%s","service_id":"%s","slot_at":"%s","payment_method":"card"}' "$SHOP_ID" "$BRANCH_ID" "$SERVICE_ID" "$SLOT_AT")"
CHECKOUT="$(post_json "$API_BASE_URL/customer/bookings/checkout" "$CHECKOUT_PAYLOAD" "$CUST_TOKEN")"
BOOKING_ID="$(echo "$CHECKOUT" | json_get "booking.id")"

echo "[4/8] partner flow confirm -> start -> complete"
PARTNER_LOGIN="$(post_json "$API_BASE_URL/auth/login" '{"user_id":"partner_1","role":"partner"}')"
PARTNER_TOKEN="$(echo "$PARTNER_LOGIN" | json_get "access_token")"
post_json "$API_BASE_URL/partner/bookings/$BOOKING_ID/confirm" "{}" "$PARTNER_TOKEN" >/dev/null
post_json "$API_BASE_URL/partner/bookings/$BOOKING_ID/start" "{}" "$PARTNER_TOKEN" >/dev/null
post_json "$API_BASE_URL/partner/bookings/$BOOKING_ID/complete" "{}" "$PARTNER_TOKEN" >/dev/null

echo "[5/8] customer history contains booking"
HISTORY="$(get_json "$API_BASE_URL/customer/bookings/cust_1" "$CUST_TOKEN")"
if ! echo "$HISTORY" | grep -q "$BOOKING_ID"; then
  echo "[FAIL] booking not found in customer history"
  exit 1
fi

echo "[6/8] admin login + critical analytics"
ADMIN_LOGIN="$(post_json "$API_BASE_URL/auth/login" '{"user_id":"admin_1","role":"admin"}')"
ADMIN_TOKEN="$(echo "$ADMIN_LOGIN" | json_get "access_token")"
get_json "$API_BASE_URL/admin/scale/zone-gates/evaluate" "$ADMIN_TOKEN" >/dev/null
get_json "$API_BASE_URL/admin/scale/unit-economics" "$ADMIN_TOKEN" >/dev/null
post_json "$API_BASE_URL/admin/scale/dynamic-pricing/estimate" '{"zone_id":"central-a","base_price":500,"hour":18,"demand_supply_ratio":1.4}' "$ADMIN_TOKEN" >/dev/null

echo "[7/8] payment webhook signature verification path"
WEBHOOK_RESPONSE_CODE="$(
  curl "${CURL_ANY_FLAGS[@]}" -o "$TMP_DIR/webhook.out" -w '%{http_code}' \
    -H "content-type: application/json" \
    -H "x-provider-signature: invalid" \
    -d "{\"booking_id\":\"$BOOKING_ID\",\"status\":\"captured\"}" \
    "$API_BASE_URL/payments/webhook"
)"
if [ "$WEBHOOK_RESPONSE_CODE" -eq 200 ]; then
  echo "[FAIL] invalid signature was accepted"
  exit 1
fi

echo "[8/8] trust signed URL endpoint"
TRUST_CODE="$(
  curl "${CURL_ANY_FLAGS[@]}" -o "$TMP_DIR/trust.out" -w '%{http_code}' \
    -H "content-type: application/json" \
    -H "authorization: Bearer $PARTNER_TOKEN" \
    -H "Idempotency-Key: smoke-$(date +%s%N)-$RANDOM" \
    -d '{"type":"id_card","filename":"id.png"}' \
    "$API_BASE_URL/partner/onboarding/partner_1/documents/presign-upload"
)"
if [ "$TRUST_CODE" -eq 404 ]; then
  echo "[WARN] presign endpoint not available on target, fallback to legacy document upload"
  post_json "$API_BASE_URL/partner/onboarding/partner_1/documents" '{"type":"id_card","url":"https://example.com/id.png"}' "$PARTNER_TOKEN" >/dev/null
elif [ "$TRUST_CODE" -lt 200 ] || [ "$TRUST_CODE" -ge 300 ]; then
  echo "[FAIL] trust endpoint failed with status $TRUST_CODE"
  cat "$TMP_DIR/trust.out"
  exit 1
fi

echo "[SUCCESS] staging smoke critical journeys passed"
