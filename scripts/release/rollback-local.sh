#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/yee/app"

cd "$ROOT_DIR"
git reset --hard HEAD~1
corepack pnpm install --frozen-lockfile=false
set -a
# shellcheck disable=SC1090
source "$ROOT_DIR/.env"
set +a
corepack pnpm --filter @barbergo/api exec prisma generate
corepack pnpm --filter @barbergo/api exec prisma migrate deploy
corepack pnpm --filter @barbergo/api build
corepack pnpm --filter @barbergo/web build
bash scripts/release/ensure-ports-free.sh
sudo -n /bin/systemctl restart barbergo-api
sudo -n /bin/systemctl restart barbergo-web

echo "[SUCCESS] Local rollback completed"
