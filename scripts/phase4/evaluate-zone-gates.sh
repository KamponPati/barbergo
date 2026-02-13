#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <zone_kpi_csv> <output_md>" >&2
  exit 1
fi

input_csv="$1"
output_md="$2"

awk -F, '
BEGIN {
  min_completion=0.92
  max_complaint=0.03
  max_refund=0.02
  max_confirm=10
  min_repeat=0.25
}
NR==1 { next }
{
  zone=$1
  completion=$2+0
  complaint=$3+0
  refund=$4+0
  confirm=$5+0
  repeat=$6+0

  status="approved"
  reasons=""
  if (completion < min_completion) { status="hold"; reasons=reasons "completion_rate;" }
  if (complaint > max_complaint) { status="hold"; reasons=reasons "complaint_rate;" }
  if (refund > max_refund) { status="hold"; reasons=reasons "refund_rate;" }
  if (confirm > max_confirm) { status="hold"; reasons=reasons "confirm_time;" }
  if (repeat < min_repeat) { status="hold"; reasons=reasons "repeat_rate;" }
  if (reasons == "") { reasons="-" }

  printf("| %s | %.2f | %.2f | %.2f | %.2f | %.2f | %s | %s |\n", zone, completion, complaint, refund, confirm, repeat, status, reasons)
}
' "$input_csv" > /tmp/phase4_zone_rows.txt

{
  echo "# Phase 4 Zone Gate Evaluation"
  echo
  echo "| zone_id | completion_rate | complaint_rate | refund_rate | confirm_time_avg_min | repeat_rate | decision | reason |"
  echo "|---|---|---|---|---|---|---|---|"
  cat /tmp/phase4_zone_rows.txt
} > "$output_md"

echo "Generated $output_md"
