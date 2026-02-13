# Phase 3 SLA and Quality Monitoring

## SLA Metrics
- confirm_time_avg_min: average minutes from request to confirm
- on_time_start_rate: % bookings started on or before scheduled time
- completion_rate: % bookings that reached completed state

## Quality Metrics
- complaint_rate: complaints / total bookings
- refund_rate: refunds / total bookings
- repeat_rate: repeat customer bookings / total bookings

## Data Feed
- Source file: `docs/ops/phase3/data/daily_bookings_metrics.csv`
- Report output: `docs/ops/phase3/reports/<date>-kpi.md`

## Escalation Rules
- confirm_time_avg_min > 10 for 2 consecutive days => open ops escalation
- on_time_start_rate < 0.9 => partner retraining required
- complaint_rate > 0.03 or refund_rate > 0.02 => trust/policy review
