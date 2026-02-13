#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <unit_economics_csv> <date> <output_md>" >&2
  exit 1
fi

input_csv="$1"
report_date="$2"
output_md="$3"

awk -F, '
NR==1 { next }
{
  zone=$2
  gross[zone]+=$3
  discount[zone]+=$4
  payment_fee[zone]+=$5
  payout[zone]+=$6
  support[zone]+=$7
  refund[zone]+=$8
  bookings[zone]+=$9
}
END {
  for (z in gross) {
    contribution = gross[z] - discount[z] - payment_fee[z] - payout[z] - support[z] - refund[z]
    if (bookings[z] > 0) {
      contribution_per_booking = contribution / bookings[z]
      take_rate = (gross[z] - payout[z]) / gross[z]
    } else {
      contribution_per_booking = 0
      take_rate = 0
    }
    printf("| %s | %.2f | %.2f | %.2f | %d | %.4f | %.2f |\n", z, gross[z], payout[z], contribution, bookings[z], take_rate, contribution_per_booking)
  }
}
' "$input_csv" > /tmp/phase4_unit_rows.txt

{
  echo "# Phase 4 Unit Economics Trend ($report_date)"
  echo
  echo "| zone_id | gross_revenue | partner_payout | contribution_margin_value | bookings | take_rate | contribution_per_booking |"
  echo "|---|---|---|---|---|---|---|"
  cat /tmp/phase4_unit_rows.txt
  echo
  echo "## Decision Note"
  echo "- Scale-up only in zones with positive contribution_per_booking and KPI gates passed."
} > "$output_md"

echo "Generated $output_md"
