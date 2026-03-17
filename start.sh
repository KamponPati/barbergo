#!/usr/bin/env bash
set -euo pipefail
ROOT="/home/yee/app3/barbergo"
cd "$ROOT/infra/docker"
docker compose up -d
cd "$ROOT"
pnpm install
cd "$ROOT/apps/web"
nohup pnpm dev > /tmp/barbergo-web.log 2>&1 &
echo $! > /tmp/barbergo-web.pid
echo "started web pid $(cat /tmp/barbergo-web.pid)"
