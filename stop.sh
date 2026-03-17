#!/usr/bin/env bash
set -euo pipefail
ROOT="/home/yee/app3/barbergo"
if [ -f /tmp/barbergo-web.pid ]; then
  PID=$(cat /tmp/barbergo-web.pid || true)
  [ -n "${PID:-}" ] && kill "$PID" 2>/dev/null || true
  rm -f /tmp/barbergo-web.pid
fi
cd "$ROOT/infra/docker"
docker compose down
