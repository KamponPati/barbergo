#!/usr/bin/env bash
set -euo pipefail

# Backup Postgres using pg_dump from the running Docker container.
# Default assumes infra/docker/docker-compose.yml container name.

OUT_DIR="${OUT_DIR:-/var/backups/barbergo}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
CONTAINER="${PG_CONTAINER:-barbergo-postgres}"
DB="${PG_DB:-barbergo}"
USER="${PG_USER:-barbergo}"
PASSWORD="${PG_PASSWORD:-barbergo}"
DOCKER_BIN="${DOCKER_BIN:-docker}"

mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/postgres_${DB}_${TS}.sql.gz"

echo "[INFO] dumping postgres: container=$CONTAINER db=$DB -> $OUT_FILE"
$DOCKER_BIN exec -e PGPASSWORD="$PASSWORD" "$CONTAINER" pg_dump -U "$USER" "$DB" | gzip -c >"$OUT_FILE"

echo "[OK] postgres backup created: $OUT_FILE"
