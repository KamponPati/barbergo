#!/usr/bin/env bash
set -euo pipefail

git rev-parse HEAD > /home/yee/app/VERSION
bash scripts/release/ensure-ports-free.sh
sudo -n /bin/systemctl restart barbergo-api
sudo -n /bin/systemctl restart barbergo-web

echo "[SUCCESS] Local full promotion completed"
