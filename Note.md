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
- Runner sudo policy configured:
- `/etc/sudoers.d/barbergo-gha` allows `yee` to run
- `sudo /bin/systemctl restart barbergo-api`
- `sudo /bin/systemctl restart barbergo-web`
- without password prompt (verified).
- Deploy hooks now run local scripts (no command parsing from GitHub secrets):
- `scripts/release/deploy-canary-local.sh`
- `scripts/release/promote-full-local.sh`
- `scripts/release/rollback-local.sh`

## Release History
- 2026-02-14: `release-prod` pipeline passed (staging domain verification + self-hosted deploy-and-verify).

## Web Serving
- 2026-02-14: migrated `barbergo-web.service` from `vite preview` to `nginx` static serving on port `5173`.
- Nginx config: `infra/nginx/barbergo-web.conf`
