#!/usr/bin/env bash
set -euo pipefail

FILE="/home/yee/app/infra/docker/docker-compose.observability.yml"

# Ensure stale named containers from previous compose project names do not block startup.
for c in barbergo-prometheus barbergo-loki barbergo-grafana barbergo-promtail barbergo-alertmanager; do
  /usr/bin/docker rm -f "$c" >/dev/null 2>&1 || true
done

if /usr/bin/docker compose version >/dev/null 2>&1; then
  exec /usr/bin/docker compose -f "$FILE" up -d
fi

exec /usr/bin/docker-compose -f "$FILE" up -d
