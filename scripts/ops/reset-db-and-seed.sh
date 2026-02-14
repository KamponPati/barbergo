#!/usr/bin/env bash
set -euo pipefail

# Destructive reset for a target environment DB, then re-apply migrations and seed.
# Intended for staging resets, never run on production unless you really mean it.
#
# Usage:
#   BARBERGO_ENV_FILE=/path/to/env bash scripts/ops/reset-db-and-seed.sh

ROOT_DIR="/home/yee/app"
ENV_FILE="${BARBERGO_ENV_FILE:-$ROOT_DIR/.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "[FAIL] env file not found: $ENV_FILE" >&2
  exit 1
fi

cd "$ROOT_DIR"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[FAIL] DATABASE_URL is required" >&2
  exit 1
fi

echo "[WARN] this will RESET the database configured by DATABASE_URL in $ENV_FILE"
echo "[INFO] applying prisma reset + migrate + seed"

corepack pnpm --filter @barbergo/api exec prisma migrate reset --force
corepack pnpm --filter @barbergo/api exec prisma db seed

echo "[SUCCESS] DB reset + seed completed"

