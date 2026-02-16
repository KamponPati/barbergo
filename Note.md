# Project Notes

Updated: 2026-02-16

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
- Sudoers template file in repo: `infra/sudoers/barbergo-gha`
- Deploy hooks now run local scripts (no command parsing from GitHub secrets):
- `scripts/release/deploy-canary-local.sh`
- `scripts/release/promote-full-local.sh`
- `scripts/release/rollback-local.sh`

## Release History
- 2026-02-14: `release-prod` pipeline passed (staging domain verification + self-hosted deploy-and-verify).

## Web Serving
- 2026-02-14: migrated `barbergo-web.service` from `vite preview` to `nginx` static serving on port `5173`.
- Nginx config: `infra/nginx/barbergo-web.conf`
- 2026-02-15: fixed web API base to same-origin and added nginx reverse proxy `/api/v1/*` -> `http://127.0.0.1:3000` (so browsers never hit `:3000` directly).

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

## Phase 6 - Infra + Recovery (DONE) (2026-02-16)
- Added promtail for nginx logs into Loki: `infra/observability/promtail/promtail-config.yml` + `infra/docker/docker-compose.observability.yml`
- Added structured request logging + request_id correlation and improved metrics:
- `apps/api/src/common/middleware/request-logging.middleware.ts`
- `apps/api/src/common/middleware/metrics.middleware.ts`
- `apps/api/src/common/services/metrics.service.ts`
- Added backup automation scripts + restore verification:
- `scripts/backup/run-backup.sh`
- `scripts/backup/backup-postgres.sh`
- `scripts/backup/backup-minio.sh`
- `scripts/backup/verify-restore.sh`
- Added systemd timer templates for backups:
- `infra/systemd/backup-barbergo.service`
- `infra/systemd/backup-barbergo.timer`
- Backup notes:
- Backup scripts use Docker (`docker exec ...`). If running backups as user `yee`, either add `yee` to `docker` group or run the backup systemd unit as `root` (template does `User=root`).
- Added staging-parity dependency compose (alt ports):
- `infra/docker/docker-compose.staging.yml`
- Backup/restore drill evidence (ran on 2026-02-15):
- Created Postgres backup: `/var/backups/barbergo/postgres_barbergo_20260215T150950Z.sql.gz`
- Restore verification passed: `sudo -n /usr/bin/bash /home/yee/app/scripts/backup/verify-restore.sh`
- Backup timer enabled: `backup-barbergo.timer` (daily 02:30)
- Observability stack started (2026-02-15):
- Prometheus: `http://127.0.0.1:9090`
- Grafana: `http://127.0.0.1:3001` (admin/admin)
- Loki: `http://127.0.0.1:3100`
- Promtail: `http://127.0.0.1:9080`
- Alertmanager: `http://127.0.0.1:9093`
- Grafana provisions datasources (uid: `prometheus`, `loki`) and dashboard `BarberGo - API Overview`.
- Prometheus SLO alerts loaded from `infra/observability/prometheus/alerts.yml` (`BarberGoApiDown`, `BarberGoHigh5xxRate`, `BarberGoHighLatency`, `BarberGoLowTraffic`).
- Added env-separation tooling:
- Templates: `infra/env/staging.env.example`, `infra/env/production.env.example`
- Bootstrap: `scripts/ops/bootstrap-env-files.sh` (installs `/etc/barbergo/{staging,production}.env`)
- Validation: `scripts/ops/check-env-parity.sh` (required key + parity check)
- 2026-02-16: bootstrapped `/etc/barbergo/staging.env` and `/etc/barbergo/production.env` and verified parity check passed.
- Added worker runtime baseline:
- `apps/api/src/worker.ts`
- `infra/systemd/barbergo-worker.service`
- Added service health check script: `scripts/ops/check-services-health.sh`
- Added reverse proxy TLS template for direct nginx TLS mode: `infra/nginx/barbergo-web.tls.conf.example`
- Added versioned image build script: `scripts/release/build-images.sh`
- Service/runtime validation:
- Build passed: `corepack pnpm -r build`
- Web shell reachable on host: `http://127.0.0.1:5173` => `200`
- Note: privileged service/docker checks depend on host sudo/docker permissions outside this sandbox.

## Phase 7 - UI/UX Hi-Fi (DONE) (2026-02-16)
- Started Wave 1 frontend theming and app-shell uplift.
- Added single-theme tokenized styling in `apps/web/src/styles.css`:
- color tokens, radius/shadows, chip/button/state styles, responsive stat grid, improved hero/shell layout.
- Added reusable UI primitives in `apps/web/src/features/shared/UiKit.tsx`:
- `UiButton`, `Chip`, `StatCard`.
- Upgraded shared state primitives:
- `StatusLine` in `apps/web/src/features/shared/UiState.tsx`
- `JsonView` restyled with `json-view` block.
- Refactored Customer/Partner/Admin pages to use unified component primitives and status/stat layouts.
- Updated app shell (`apps/web/src/app/layout/AppLayout.tsx`) and auth/login/forbidden views for consistent theme and hierarchy.
- Wave 2 complete (foundation extension):
- Added shared components:
- `apps/web/src/features/shared/FormControls.tsx` (`Field`, `Input`, `Select`)
- `apps/web/src/features/shared/Tabs.tsx`
- `apps/web/src/features/shared/DataTable.tsx`
- `apps/web/src/features/shared/Skeleton.tsx`
- `apps/web/src/features/shared/Toast.tsx`
- Refactored role pages into richer UI flows with tabs/forms/tables/toasts while keeping existing API endpoints:
- `apps/web/src/features/customer/CustomerPage.tsx`
- `apps/web/src/features/partner/PartnerPage.tsx`
- `apps/web/src/features/admin/AdminPage.tsx`
- Validation:
- `corepack pnpm --filter @barbergo/web lint` passed
- `corepack pnpm --filter @barbergo/web build` passed
- Wave 5 complete (Phase 7 closure):
- Expanded TH/EN i18n coverage across app shell and role pages (customer/partner/admin + auth screens).
- Added localized breadcrumb labels and stronger role-copy consistency.
- Added PWA install UX prompt component: `apps/web/src/features/pwa/PwaInstall.tsx`.
- Added semantic status/alert roles for loading/error/empty states and keyboard-first improvements.
- Phase 7 status moved to DONE in `task.md` (signed on 2026-02-16).
- Wave 3 complete (navigation + interaction components):
- Added `UiBadge`, `UiModal`, `UiDrawer` in `apps/web/src/features/shared/UiKit.tsx`.
- Added shell breadcrumb + route transition baseline in `apps/web/src/app/layout/AppLayout.tsx`.
- Applied modal confirmation flow to customer checkout and drawer detail flow to partner operations.
- Extended styles for breadcrumbs, badges, overlay/modal/drawer, and transition animation in `apps/web/src/styles.css`.
- Wave 4 complete (i18n/timezone + a11y baseline):
- Added i18n provider: `apps/web/src/features/i18n/I18nContext.tsx` with TH/EN locale state, `Asia/Bangkok` timezone-safe datetime formatting, and THB currency formatting.
- App root wrapped with i18n provider: `apps/web/src/App.tsx`.
- Added locale toggle (TH/EN) in app shell and reused i18n labels in auth/login/forbidden views.
- Updated customer/partner/admin pages to use shared currency/date formatters for table/detail outputs.
- Added a11y baseline improvements:
- skip-to-content link, focus-visible styles, table captions, keyboard escape close for modal/drawer.
- Added PWA baseline:
- `apps/web/public/manifest.webmanifest`
- `apps/web/public/sw.js` (shell-only caching; excludes `/api/*`)
- `apps/web/src/main.tsx` service worker registration
- `apps/web/index.html` manifest/theme-color wiring
- Validation:
- `corepack pnpm --filter @barbergo/web lint` passed
- `corepack pnpm --filter @barbergo/web build` passed
