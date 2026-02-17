# Phase 11 - UAT / Go-Live / Sign-off Pack

Date: 2026-02-17
Owner: Codex

## UAT Coverage
- Customer flow: login -> discovery -> availability -> quote -> checkout -> history
- Partner flow: login -> queue -> confirm -> start -> complete -> finance
- Admin flow: login -> governance/analytics/pricing controls
- Evidence:
  - automated smoke: `scripts/staging/smoke-critical-journeys.sh`
  - weekly regression: `scripts/staging/full-e2e-regression.sh`
  - app shell + role routes in web/mobile codebase

## Go-Live Readiness
- Checklist baseline: `docs/ops/release/production-go-live-checklist.md`
- Incident escalation and comms templates:
  - `docs/ops/oncall/incident-escalation-matrix.md`
  - `docs/ops/oncall/incident-communication-templates.md`

## Hypercare Plan
- 7-day war-room cadence with daily KPI + incident summaries
- Issue automation from scheduled workflows used as incident feeder

## Final Status
- Engineering acceptance: ready
- Operational long-window acceptance (7-day SLO + hypercare): pending elapsed runtime window
