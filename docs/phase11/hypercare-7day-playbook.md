# Phase 11 Hypercare 7-Day Playbook

Date: 2026-02-17

## Goal
Close Hypercare 7-day gate with consistent daily evidence and incident handling.

## Daily Cadence (Day 1-7)
1. Check nightly smoke result (`ops-scheduled-validation`)
2. Check window gate evaluation (`phase11-window-gate`)
3. Review daily snapshot artifact (`phase11-hypercare-daily`)
4. If failure occurs, open/triage incident and attach request IDs
5. Post summary in `Phase11 Window Gate Tracker` issue

## Required Evidence
- 7 distinct successful nightly smoke dates
- At least 1 successful weekly full e2e run in 7-day window
- Daily hypercare snapshots (health + headers baseline)
- Incident timeline and resolution notes (if any)

## Completion Criteria
- `slo_window_pass=true`
- `hypercare_pass=true`
- No unresolved sev1/sev2 incidents for go-live scope

## Output
When criteria pass, update:
- `task.md` (set Hypercare and Phase 11 Signed to DONE)
- append sign-off note under `docs/phase11/*`
