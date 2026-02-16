#!/usr/bin/env bash
set -euo pipefail

# Bootstrap /etc/barbergo/{staging,production}.env from repo templates if missing.
# Existing files are never overwritten.

ROOT_DIR="/home/yee/app"
TARGET_DIR="/etc/barbergo"

install_if_missing() {
  local src="$1"
  local dest="$2"
  if [ -f "$dest" ]; then
    echo "[INFO] exists, skip: $dest"
    return 0
  fi
  install -m 0600 "$src" "$dest"
  echo "[OK] installed: $dest"
}

mkdir -p "$TARGET_DIR"
chmod 700 "$TARGET_DIR"

install_if_missing "$ROOT_DIR/infra/env/staging.env.example" "$TARGET_DIR/staging.env"
install_if_missing "$ROOT_DIR/infra/env/production.env.example" "$TARGET_DIR/production.env"

echo "[SUCCESS] env bootstrap done"
echo "[NEXT] edit secrets in:"
echo "  - $TARGET_DIR/staging.env"
echo "  - $TARGET_DIR/production.env"

