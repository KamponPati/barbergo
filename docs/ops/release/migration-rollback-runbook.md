# Migration and Rollback Runbook

## Scope
- API + Web release on staging/production
- Schema changes (Prisma migrations)
- Emergency rollback path

## Backward-Compatible Migration Policy
- Use expand-and-contract only.
- Add new columns/tables first, deploy app reading/writing both paths, then remove old paths in later release.
- Avoid destructive SQL in same release (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`).
- Keep migrations immutable after merge.

## Release Gates
1. Run `bash scripts/release/predeploy-gate.sh`.
2. Verify staging smoke: `bash scripts/staging/smoke-critical-journeys.sh`.
3. Confirm error budget and alert state are healthy before production.
4. Start production rollout with canary (low traffic slice first).
5. Validate post-deploy SLO guardrails:
   - `http_req_failed < 1%`
   - `p95 latency < 800ms` for discovery/booking critical APIs

## Rollback Triggers
- 5xx spikes above SLO for 5 minutes.
- Login/checkout critical journey fails.
- Data corruption risk found in audit logs or reconciliation signals.

## Rollback Procedure
1. Stop rollout immediately.
2. Route traffic to previous stable version (blue/green switch or canary rollback).
3. Disable risky feature flags for new flows.
4. Run smoke checks on previous stable version.
5. Open incident channel and attach timeline + request IDs.

## Data Rollback Rule
- Do not roll back schema by destructive down migration in production.
- If data fix is needed, apply forward hotfix migration.
- Restore from backup only when approved by incident commander and data owner.

## Evidence Checklist
- CI logs for lint/test/build
- Migration safety check logs
- Staging smoke logs
- Production smoke logs
- Incident/rollback notes (if any)
