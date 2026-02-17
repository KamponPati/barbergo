# Phase 11 Window Gate Automation

Date: 2026-02-17

## Purpose
Automate evaluation of the two time-window blockers:
- SLO 7-day window gate
- Hypercare 7-day gate

## Workflow
- File: `.github/workflows/phase11-window-gate.yml`
- Trigger:
  - daily schedule (`45 18 * * *`)
  - manual dispatch

## Input Requirement
Set repository variable:
- `PHASE11_GO_LIVE_DATE` (format `YYYY-MM-DD`)

## Data Source
- Reads workflow runs from `.github/workflows/ops-scheduled-validation.yml`
- Uses run title markers to separate:
  - nightly smoke cron: `15 18 * * *`
  - weekly full e2e cron: `30 19 * * 0`

## Pass Criteria
- `slo_window_pass`:
  - at least 7 days elapsed since go-live
  - at least 7 successful nightly smoke run dates in last 7 days
- `hypercare_pass`:
  - same as SLO gate
  - and at least one successful weekly full e2e run in last 7 days

## Operational Output
- Writes run summary in workflow
- Creates/updates issue: `Phase11 Window Gate Tracker`
- Fails workflow while criteria are not yet satisfied

## Related Fix
- `ops-scheduled-validation.yml` conditions were tightened so nightly/weekly jobs run only on intended cron schedule.
