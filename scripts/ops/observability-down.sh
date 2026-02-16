#!/usr/bin/env bash
set -euo pipefail

FILE="/home/yee/app/infra/docker/docker-compose.observability.yml"

if /usr/bin/docker compose version >/dev/null 2>&1; then
  exec /usr/bin/docker compose -f "$FILE" down
fi

exec /usr/bin/docker-compose -f "$FILE" down
