#!/usr/bin/env bash
set -euo pipefail

# Install systemd unit files from this repo into /etc/systemd/system and (re)start.
# Requires sudo.

units=(
  barbergo-api.service
  barbergo-web.service
  backup-barbergo.service
  backup-barbergo.timer
)

echo "[INFO] installing units to /etc/systemd/system"
for u in "${units[@]}"; do
  sudo install -m 0644 "infra/systemd/$u" "/etc/systemd/system/$u"
done

sudo systemctl daemon-reload
sudo systemctl enable --now barbergo-api.service barbergo-web.service
sudo systemctl enable --now backup-barbergo.timer
sudo systemctl restart barbergo-api.service barbergo-web.service

echo "[SUCCESS] installed and restarted"

