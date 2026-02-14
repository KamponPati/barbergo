#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/yee/app"

cd "$ROOT_DIR"
git reset --hard HEAD~1
corepack pnpm install --frozen-lockfile=false
corepack pnpm --filter @barbergo/api build
corepack pnpm --filter @barbergo/web build
sudo -n /bin/systemctl restart barbergo-api
sudo -n /bin/systemctl restart barbergo-web

echo "[SUCCESS] Local rollback completed"
