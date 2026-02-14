# Project Notes

Updated: 2026-02-14

## Environment URLs
- Staging Web URL: `https://staging.jfav.cloud`
- Staging API Base URL: `https://api-staging.jfav.cloud/api/v1`

## GitHub Repository
- Repo: `https://github.com/KamponPati/barbergo`
- Default branch: `main`

## Workflow Setup Status
- `staging` environment: configured
- `STAGING_WEB_URL`: configured
- `production` environment: configured
- `production` secrets: configured by user in GitHub

## Runtime Hardening (2026-02-14)
- Systemd services enabled:
- `barbergo-api.service`
- `barbergo-web.service`
- Installed at:
- `/etc/systemd/system/barbergo-api.service`
- `/etc/systemd/system/barbergo-web.service`
- Cloudflare tunnel container restart policy:
- `unless-stopped`
- Current checks:
- `http://127.0.0.1:3000/health/live` => `{"status":"ok"}`
- `https://staging.jfav.cloud` => `200`

## Production Secrets (Configured)
- `PROD_DEPLOY_CANARY_CMD`
- `PROD_DEPLOY_FULL_CMD`
- `PROD_ROLLBACK_CMD`

## Current Stage
- GitHub repo pushed: done
- Cloudflare tunnel routing: done (`staging.jfav.cloud` now returns `200`)
- Services persistent after restart: done (`systemd` + cloudflared restart policy)
- Next verification step: run GitHub Actions `staging-e2e`, `security`, `perf-smoke`, and `release-prod`

## Release Pipeline Update (2026-02-14)
- `release-prod` job `deploy-and-verify` changed to `self-hosted` runner to avoid SSH timeout from GitHub-hosted runners to private IPs.
- Workflow file updated: `.github/workflows/release-prod.yml`
- Runner sudo policy: required for CI deploy hooks.
- `scripts/release/*` uses `sudo -n /bin/systemctl restart barbergo-api|barbergo-web`.
- If `sudo -n` still prompts for password, deploy jobs will fail until a NOPASSWD sudoers rule is installed.
- Deploy hooks now run local scripts (no command parsing from GitHub secrets):
- `scripts/release/deploy-canary-local.sh`
- `scripts/release/promote-full-local.sh`
- `scripts/release/rollback-local.sh`

## Release History
- 2026-02-14: `release-prod` pipeline passed (staging domain verification + self-hosted deploy-and-verify).

## Web Serving
- 2026-02-14: migrated `barbergo-web.service` from `vite preview` to `nginx` static serving on port `5173`.
- Nginx config: `infra/nginx/barbergo-web.conf`

## Phase 5 - Data + Domain (DB Backing) (2026-02-14)
- Added Prisma core schema for marketplace domains (shop/branch/service/staff/booking/payment/ledger/review/dispute/etc).
- Added `SlotReservation` table for conflict-free slot locking.
- Added `apps/api/prisma/seed.ts` to seed demo identities and shops used by the web shell (`admin_1`, `partner_1`, `cust_1`, `shop_1/2`).
- Implemented `apps/api/src/common/services/db-core.service.ts` and switched these endpoints to DB-backed logic:
- `GET /api/v1/discovery/*`
- `POST /api/v1/customer/bookings/quote`
- `POST /api/v1/customer/bookings/checkout`
- `GET /api/v1/customer/bookings/:customerId`
- `POST /api/v1/partner/bookings/:bookingId/(confirm|start|complete)`
- Notes: write endpoints require `Idempotency-Key` header by design.
- Release scripts updated to run `prisma generate` + `prisma migrate deploy` before restarting services (seed is optional via `BARBERGO_RUN_SEED=true`).
- Persisted idempotency store to Redis (in-memory fallback).
- Persisted auth refresh sessions to DB table `AuthSession` (rotation/revoke survives restart).
- Persisted audit logs to DB table `AuditLog` (best-effort write; admin can read historical logs).
- Added admin reconciliation summary endpoint:
- `GET /api/v1/admin/reconciliation/daily?date=YYYY-MM-DD`
- Added deploy guard for port conflicts (single-host runner): `scripts/release/ensure-ports-free.sh`
