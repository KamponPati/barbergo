#!/usr/bin/env bash
set -euo pipefail

# Restore verification: start a temporary Postgres container, restore latest dump, run a sanity query.
# Requires Docker.

BACKUP_DIR="${BACKUP_DIR:-/var/backups/barbergo}"
DB="${DB:-barbergo}"
USER="${USER:-barbergo}"
PASSWORD="${PASSWORD:-barbergo}"
DOCKER_BIN="${DOCKER_BIN:-docker}"

latest="$(ls -1t "$BACKUP_DIR"/postgres_"$DB"_*.sql.gz 2>/dev/null | head -n 1 || true)"
if [ -z "$latest" ]; then
  echo "[FAIL] no backups found in $BACKUP_DIR (expected postgres_${DB}_*.sql.gz)" >&2
  exit 1
fi

name="barbergo-restore-verify-$RANDOM"
echo "[INFO] using backup: $latest"
echo "[INFO] starting temp postgres: $name"

cid="$($DOCKER_BIN run -d --rm \
  --name "$name" \
  -e POSTGRES_DB="$DB" \
  -e POSTGRES_USER="$USER" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p 0:5432 \
  postgres:16-alpine)"

cleanup() {
  $DOCKER_BIN stop "$cid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[INFO] waiting for postgres ready"
for i in $(seq 1 30); do
  if $DOCKER_BIN exec "$cid" pg_isready -U "$USER" -d "$DB" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[INFO] restoring dump into temp postgres"
gunzip -c "$latest" | $DOCKER_BIN exec -i "$cid" psql -U "$USER" -d "$DB" >/dev/null

echo "[INFO] running sanity checks"
$DOCKER_BIN exec "$cid" psql -U "$USER" -d "$DB" -c "select count(*) as users from \"User\";" >/dev/null
$DOCKER_BIN exec "$cid" psql -U "$USER" -d "$DB" -c "select count(*) as bookings from \"Booking\";" >/dev/null

echo "[SUCCESS] restore verification passed"
