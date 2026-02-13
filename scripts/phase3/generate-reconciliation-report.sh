#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <gateway_csv> <internal_csv> <date> <output_md>" >&2
  exit 1
fi

gateway_csv="$1"
internal_csv="$2"
report_date="$3"
output_md="$4"

declare -A gateway_map
while IFS=, read -r booking_id amount status; do
  [ "$booking_id" = "booking_id" ] && continue
  gateway_map["$booking_id"]="$amount,$status"
done < "$gateway_csv"

declare -A internal_map
while IFS=, read -r booking_id amount status; do
  [ "$booking_id" = "booking_id" ] && continue
  internal_map["$booking_id"]="$amount,$status"
done < "$internal_csv"

mismatch_count=0
gateway_total=0
internal_total=0
lines=""

for booking_id in "${!gateway_map[@]}"; do
  gateway_entry="${gateway_map[$booking_id]}"
  internal_entry="${internal_map[$booking_id]-MISSING}"

  gateway_amount="${gateway_entry%%,*}"
  gateway_status="${gateway_entry##*,}"
  gateway_total=$((gateway_total + gateway_amount))

  if [ "$internal_entry" = "MISSING" ]; then
    mismatch_count=$((mismatch_count + 1))
    lines+="| $booking_id | $gateway_amount/$gateway_status | missing | missing_internal |"$'\n'
    continue
  fi

  internal_amount="${internal_entry%%,*}"
  internal_status="${internal_entry##*,}"
  internal_total=$((internal_total + internal_amount))

  if [ "$gateway_amount" != "$internal_amount" ] || [ "$gateway_status" != "$internal_status" ]; then
    mismatch_count=$((mismatch_count + 1))
    lines+="| $booking_id | $gateway_amount/$gateway_status | $internal_amount/$internal_status | mismatch |"$'\n'
  fi

done

for booking_id in "${!internal_map[@]}"; do
  if [ -z "${gateway_map[$booking_id]+x}" ]; then
    internal_entry="${internal_map[$booking_id]}"
    internal_amount="${internal_entry%%,*}"
    internal_status="${internal_entry##*,}"
    internal_total=$((internal_total + internal_amount))
    mismatch_count=$((mismatch_count + 1))
    lines+="| $booking_id | missing | $internal_amount/$internal_status | missing_gateway |"$'\n'
  fi
done

{
  echo "# Daily Reconciliation Report ($report_date)"
  echo
  echo "- Gateway total amount: $gateway_total"
  echo "- Internal total amount: $internal_total"
  echo "- Mismatch count: $mismatch_count"
  echo
  echo "## Details"
  echo
  echo "| booking_id | gateway | internal | issue |"
  echo "|---|---|---|---|"
  if [ "$mismatch_count" -eq 0 ]; then
    echo "| - | - | - | no_mismatch |"
  else
    printf "%s" "$lines"
  fi
} > "$output_md"

echo "Generated $output_md"
