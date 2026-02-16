#!/usr/bin/env bash
set -euo pipefail

# Install systemd unit files from this repo into /etc/systemd/system and (re)start.
# Requires sudo.

SUDO="sudo"
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
fi

units=(
  barbergo-api.service
  barbergo-web.service
  barbergo-worker.service
  backup-barbergo.service
  backup-barbergo.timer
)

echo "[INFO] installing units to /etc/systemd/system"
for u in "${units[@]}"; do
  $SUDO install -m 0644 "infra/systemd/$u" "/etc/systemd/system/$u"
done

$SUDO systemctl daemon-reload
$SUDO systemctl enable --now barbergo-api.service barbergo-web.service barbergo-worker.service
$SUDO systemctl enable --now backup-barbergo.timer
$SUDO systemctl restart barbergo-api.service barbergo-web.service barbergo-worker.service

echo "[SUCCESS] installed and restarted"
