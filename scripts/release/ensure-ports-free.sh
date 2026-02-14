#!/usr/bin/env bash
set -euo pipefail

# Guard against "EADDRINUSE" deploy failures when a dev process is still
# listening on production ports (common on single-host self-hosted runners).
#
# Strategy:
# - If the systemd unit is ACTIVE, assume it's the intended listener.
# - Otherwise, if the port is occupied by a known BarberGo process, kill it.
# - If the port is occupied by an unknown process, fail fast to avoid
#   accidentally killing something unrelated.

ensure_port_free_when_service_not_active() {
  local port="$1"
  local service="$2"
  local allowed_cmd_regex="$3"

  local state
  state="$(systemctl is-active "$service" 2>/dev/null || true)"
  if [ "$state" = "active" ]; then
    return 0
  fi

  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -z "$pids" ]; then
    return 0
  fi

  for pid in $pids; do
    local cmd
    cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    if [ -z "$cmd" ]; then
      continue
    fi

    if echo "$cmd" | grep -Eq "$allowed_cmd_regex"; then
      echo "[WARN] killing stray listener on port $port (pid=$pid, service=$service, state=$state): $cmd" >&2
      kill "$pid" 2>/dev/null || true
    else
      echo "[FAIL] port $port is occupied by unexpected process (pid=$pid, service=$service, state=$state): $cmd" >&2
      exit 1
    fi
  done

  sleep 1
}

ensure_port_free_when_service_not_active 3000 barbergo-api '(@barbergo/api|apps/api|dist/main\.js|start:dev)'
ensure_port_free_when_service_not_active 5173 barbergo-web '(nginx|barbergo-web|apps/web/dist)'

echo "[OK] ports checked"

