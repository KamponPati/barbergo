#!/usr/bin/env bash
set -euo pipefail

sudo -n /bin/systemctl restart barbergo-api
sudo -n /bin/systemctl restart barbergo-web

echo "[SUCCESS] Local full promotion completed"
