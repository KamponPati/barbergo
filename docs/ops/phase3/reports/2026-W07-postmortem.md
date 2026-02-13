# Weekly Postmortem

## Header
- Week: 2026-W07
- Incident/Theme: Booking confirmation delay in west-b zone
- Owner: Ops West Lead
- Date: 2026-02-13

## Summary
- What happened: confirm time exceeded threshold for one partner during peak window.
- Customer impact: 7 bookings had confirmation delay over 10 minutes.
- Partner impact: increased cancellation risk and queue backlog.

## Timeline
- T0: KPI war room flagged confirm_time_avg_min at 11.2.
- T1: Ops identified staffing gap in partner_3.
- T2: Temporary cap applied and retraining scheduled.

## Root Cause
- Primary cause: understaffed confirmation desk during lunch peak.
- Contributing factors: no backup responder in shift plan.

## Corrective Actions
| Action | Owner | Due Date | Status |
|---|---|---|---|
| Add backup confirmer shift for west-b | Partner Success | 2026-02-16 | Open |
| Enable queue alert when confirm wait > 8 min | Engineering | 2026-02-18 | Open |
| Retrain partner_3 on queue triage SOP | Ops West | 2026-02-15 | Open |

## Prevention
- Monitoring added: partner-level confirm SLA breach alert.
- Policy/process update: mandatory backup shift in pilot zones.
