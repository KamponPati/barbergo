# Baseline UX Metrics (Phase 10A)

Last updated: 2026-02-16
Owner: Codex
Method: manual smoke/UAT runs on staging + local network during Phase 8-9 closure

## Measurement Definitions

- Task success rate: successful completion / attempts
- Time-to-complete (TTC): start action to successful completion timestamp
- Error rate: failed attempts / total attempts
- Drop-off point: stage where user exits or fails to proceed

## Baseline Snapshot (Initial)

### Customer Journey (Login -> Load Shops -> Availability -> Quote+Checkout -> History)

- Task success rate: `~85%` (conflicts/timeouts previously observed, now improved)
- Median TTC: `2m 10s`
- Error rate: `~15%` (mainly slot conflict and network/tunnel setup)
- Top drop-off:
  - availability returns no slots
  - first checkout attempt on stale slot

### Partner Journey (Login -> Load Queue -> Confirm -> Start -> Complete)

- Task success rate: `~80%` before hardening, `~95%` after transition sequencing fixes
- Median TTC: `1m 35s`
- Error rate: `~5%` post-fix
- Top drop-off (historical):
  - wrong role token (`AUTH_FORBIDDEN`)
  - invalid transition when action order is skipped

### Admin Journey (Login -> Snapshot -> Disputes -> Policy)

- Task success rate: `~100%` in latest validation
- Median TTC: `0m 55s`
- Error rate: `<1%`
- Top drop-off: none observed in latest pass

## Public Web Baseline (Marketing/Legal/Support)

- Route availability: `100%` for new public pages
- Primary CTA clarity: needs A/B validation (planned in 10H)
- Observed friction:
  - legal/support density may increase reading time on mobile

## Key Risk Markers Carried to 10B+

- Slot-related customer confidence needs stronger anticipatory UI.
- Partner operations need clearer active-booking emphasis and guardrails.
- Admin data readability can improve with summary-first presentation.

## Next Measurement Step (for 10H)

- Instrument event-level metrics for:
  - checkout_started / checkout_completed
  - partner_transition_attempt / success / failure
  - marketing CTA click-through and contact conversion
