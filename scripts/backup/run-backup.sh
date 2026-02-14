#!/usr/bin/env bash
set -euo pipefail

# One-shot backup runner (DB + MinIO). Safe to run from cron/systemd timer.

OUT_DIR="${OUT_DIR:-/var/backups/barbergo}"
DOCKER_BIN="${DOCKER_BIN:-docker}"

mkdir -p "$OUT_DIR"

OUT_DIR="$OUT_DIR" DOCKER_BIN="$DOCKER_BIN" bash scripts/backup/backup-postgres.sh

# MinIO is optional. If MINIO_BUCKET is not set and default infra isn't running, this may fail.
if $DOCKER_BIN ps --format '{{.Names}}' | grep -qx 'barbergo-minio'; then
  OUT_DIR="$OUT_DIR/minio" DOCKER_BIN="$DOCKER_BIN" bash scripts/backup/backup-minio.sh || true
else
  echo "[INFO] skipping minio backup (container barbergo-minio not running)"
fi

echo "[SUCCESS] backup completed"
