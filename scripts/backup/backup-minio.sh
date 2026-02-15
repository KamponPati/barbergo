#!/usr/bin/env bash
set -euo pipefail

# Backup MinIO bucket contents via minio/mc (runs as a one-shot container).
# Works even if "mc" isn't installed on the host.
#
# NOTE: This mirrors objects only. Keep DB backups separately.

OUT_DIR="${OUT_DIR:-/var/backups/barbergo/minio}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
DOCKER_BIN="${DOCKER_BIN:-docker}"

MINIO_ENDPOINT="${MINIO_ENDPOINT:-127.0.0.1}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_USE_SSL="${MINIO_USE_SSL:-false}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
MINIO_BUCKET="${MINIO_BUCKET:-barbergo}"

mkdir -p "$OUT_DIR"
DEST="$OUT_DIR/${MINIO_BUCKET}_${TS}"

scheme="http"
if [ "$MINIO_USE_SSL" = "true" ]; then
  scheme="https"
fi

echo "[INFO] mirroring minio bucket: ${scheme}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET} -> $DEST"

# minio/mc image does not ship with a shell, so run mc twice using a shared config dir.
MC_CONFIG_DIR="$OUT_DIR/.mc-config"
mkdir -p "$MC_CONFIG_DIR"

$DOCKER_BIN run --rm \
  --network host \
  -v "$MC_CONFIG_DIR:/root/.mc" \
  minio/mc:RELEASE.2025-01-17T23-25-50Z \
  alias set barbergo "${scheme}://${MINIO_ENDPOINT}:${MINIO_PORT}" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

$DOCKER_BIN run --rm \
  --network host \
  -v "$MC_CONFIG_DIR:/root/.mc" \
  minio/mc:RELEASE.2025-01-17T23-25-50Z \
  ls "barbergo/${MINIO_BUCKET}" >/dev/null 2>&1 || {
  echo "[WARN] minio bucket does not exist, skipping mirror: $MINIO_BUCKET"
  exit 0
}

$DOCKER_BIN run --rm \
  --network host \
  -v "$MC_CONFIG_DIR:/root/.mc" \
  -v "$OUT_DIR:/backup" \
  minio/mc:RELEASE.2025-01-17T23-25-50Z \
  mirror --overwrite "barbergo/${MINIO_BUCKET}" "/backup/$(basename "$DEST")"

echo "[OK] minio mirror completed: $DEST"
