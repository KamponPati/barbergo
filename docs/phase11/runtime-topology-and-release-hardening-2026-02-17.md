# Phase 11 - Runtime Topology and Release Hardening

Date: 2026-02-17
Owner: Codex

## Production Topology
- Cloudflare edge/tunnel -> host nginx -> api/web systemd services
- Local-origin smoke path for self-hosted runner deploy verification

## Release Hardening
- Core workflows:
  - CI: `.github/workflows/ci.yml`
  - Security: `.github/workflows/security.yml`
  - Staging e2e: `.github/workflows/staging-e2e.yml`
  - Perf smoke: `.github/workflows/perf-smoke.yml`
  - Release: `.github/workflows/release-prod.yml`
- Scheduled operations validation:
  - `.github/workflows/ops-scheduled-validation.yml`

## Rollout / Rollback
- Canary + blue/green strategy and rollback criteria:
  - `docs/ops/release/release-strategy.md`
  - `docs/ops/release/migration-rollback-runbook.md`

## Runner Hardening Notes
- Least-privilege restart sudoers in place for release hooks
- Deploy actions restricted to approved scripts

## Conclusion
- Deployment/runtime hardening accepted for current release baseline.
