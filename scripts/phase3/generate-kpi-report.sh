#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <daily_metrics_csv> <date> <output_md>" >&2
  exit 1
fi

metrics_csv="$1"
report_date="$2"
output_md="$3"

awk -F, '
BEGIN {
  total=0
  confirm_sum=0
  on_time=0
  completed=0
  complaints=0
  refunds=0
  repeats=0
}
NR==1 {next}
{
  total += 1
  confirm_sum += $2
  on_time += $3
  completed += $4
  complaints += $5
  refunds += $6
  repeats += $7
}
END {
  if (total == 0) {
    print "0,0,0,0,0,0"
    exit
  }

  printf "%.2f,%.4f,%.4f,%.4f,%.4f,%.4f\n", \
    (confirm_sum/total), (on_time/total), (completed/total), (complaints/total), (refunds/total), (repeats/total)
}
' "$metrics_csv" | {
  IFS=, read -r confirm_avg on_time_rate completion_rate complaint_rate refund_rate repeat_rate
  {
    echo "# Daily KPI Report ($report_date)"
    echo
    echo "- confirm_time_avg_min: $confirm_avg"
    echo "- on_time_start_rate: $on_time_rate"
    echo "- completion_rate: $completion_rate"
    echo "- complaint_rate: $complaint_rate"
    echo "- refund_rate: $refund_rate"
    echo "- repeat_rate: $repeat_rate"
    echo
    echo "## Threshold Check"
    echo
    awk -v confirm_avg="$confirm_avg" -v on_time="$on_time_rate" -v completion="$completion_rate" -v complaint="$complaint_rate" -v refund="$refund_rate" -v repeat="$repeat_rate" '
      BEGIN {
        print "| metric | threshold | actual | status |"
        print "|---|---|---|---|"
        print "| confirm_time_avg_min | <= 10.00 | " confirm_avg " | " ((confirm_avg+0 <= 10.0) ? "pass" : "fail") " |"
        print "| on_time_start_rate | >= 0.90 | " on_time " | " ((on_time+0 >= 0.90) ? "pass" : "fail") " |"
        print "| completion_rate | >= 0.92 | " completion " | " ((completion+0 >= 0.92) ? "pass" : "fail") " |"
        print "| complaint_rate | <= 0.03 | " complaint " | " ((complaint+0 <= 0.03) ? "pass" : "fail") " |"
        print "| refund_rate | <= 0.02 | " refund " | " ((refund+0 <= 0.02) ? "pass" : "fail") " |"
        print "| repeat_rate | >= 0.25 | " repeat " | " ((repeat+0 >= 0.25) ? "pass" : "fail") " |"
      }
    '
  } > "$output_md"

  echo "Generated $output_md"
}
