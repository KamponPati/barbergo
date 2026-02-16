#!/usr/bin/env bash
set -euo pipefail

# Build versioned Docker images from git SHA.
# Usage:
#   IMAGE_REGISTRY=ghcr.io/my-org IMAGE_REPO=barbergo bash scripts/release/build-images.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTRY="${IMAGE_REGISTRY:-local}"
REPO="${IMAGE_REPO:-barbergo}"
SHA="$(git -C "$ROOT_DIR" rev-parse --short=12 HEAD)"
API_IMAGE="${REGISTRY}/${REPO}/api:${SHA}"
WEB_IMAGE="${REGISTRY}/${REPO}/web:${SHA}"

echo "[INFO] building api image: $API_IMAGE"
docker build -f "$ROOT_DIR/apps/api/Dockerfile" -t "$API_IMAGE" "$ROOT_DIR"

echo "[INFO] building web image: $WEB_IMAGE"
docker build -f "$ROOT_DIR/apps/web/Dockerfile" -t "$WEB_IMAGE" "$ROOT_DIR"

echo "[SUCCESS] built images"
echo "API_IMAGE=$API_IMAGE"
echo "WEB_IMAGE=$WEB_IMAGE"
