#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] systemd states"
systemctl is-active barbergo-api barbergo-web barbergo-worker >/dev/null

echo "[2/4] API live"
curl -fsS http://127.0.0.1:3000/health/live >/dev/null

echo "[3/4] API ready"
curl -fsS http://127.0.0.1:3000/health/ready >/dev/null

echo "[4/4] web shell"
curl -fsS http://127.0.0.1:5173/ >/dev/null

echo "[SUCCESS] service health checks passed"

