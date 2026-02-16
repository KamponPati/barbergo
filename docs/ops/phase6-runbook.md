# Phase 6 Runbook (Staging/Prod Ops)

Updated: 2026-02-15

## URLs (Staging)

- Web: `https://staging.jfav.cloud`
- API base: `https://staging.jfav.cloud/api/v1`
- API health: `https://staging.jfav.cloud/health/live`

## Services (Systemd)

- API: `barbergo-api.service`
- Web (nginx static + reverse proxy): `barbergo-web.service`

Commands:

```bash
sudo -n /bin/systemctl restart barbergo-api
sudo -n /bin/systemctl restart barbergo-web
systemctl status barbergo-api --no-pager
systemctl status barbergo-web --no-pager
```

## Environment Separation (Staging vs Production)

The API service reads `/etc/barbergo/production.env` (primary) and keeps local `.env` as fallback.

Bootstrap env files once:

```bash
sudo bash scripts/ops/bootstrap-env-files.sh
```

Validate key parity and required keys:

```bash
sudo bash scripts/ops/check-env-parity.sh
```

Files:
- `/etc/barbergo/staging.env`
- `/etc/barbergo/production.env`

## Smoke Test

```bash
API_BASE_URL=http://127.0.0.1:5173/api/v1 \
WEB_BASE_URL=http://127.0.0.1:5173 \
bash scripts/staging/smoke-critical-journeys.sh
```

## Observability Stack (Local)

Starts Prometheus + Loki + Grafana + Promtail (tails nginx logs in `/tmp`):

```bash
docker compose -f infra/docker/docker-compose.observability.yml up -d || \
docker-compose -f infra/docker/docker-compose.observability.yml up -d
```

Default ports:
- Prometheus: `http://localhost:9090`
- Loki: `http://localhost:3100`
- Grafana: `http://localhost:3001` (admin/admin)

Dashboard:
- `BarberGo - API Overview` (auto-provisioned)

SLO alert rules (Prometheus):
- `BarberGoApiDown`
- `BarberGoHigh5xxRate`
- `BarberGoHighLatency`
- `BarberGoLowTraffic`

Alertmanager:
- URL: `http://localhost:9093`

Health check:
```bash
bash scripts/ops/observability-check.sh
```

## Backups

Backup scripts assume Docker access.

Option A (recommended): run backups as `root` via systemd timer templates:

1. Install units:
```bash
sudo bash scripts/ops/install-systemd-units.sh
```

2. Verify timer:
```bash
systemctl list-timers | rg backup-barbergo
```

Option B: manual run (requires docker permissions):

```bash
sudo bash scripts/backup/run-backup.sh
sudo bash scripts/backup/verify-restore.sh
```

## Staging Parity Dependencies

Bring up staging dependencies (alternate ports):

```bash
docker compose -f infra/docker/docker-compose.staging.yml up -d
```

Ports:
- Postgres: `localhost:55432`
- Redis: `localhost:56379`
- MinIO: `localhost:59000` / console `:59001`

## Container Packaging (Optional)

Build+run full app via compose (includes api + web + deps):

```bash
docker compose -f infra/docker/docker-compose.app.yml up -d --build
```
