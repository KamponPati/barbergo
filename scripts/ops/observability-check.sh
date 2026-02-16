#!/usr/bin/env bash
set -euo pipefail

wait_ready() {
  local name="$1"
  local url="$2"
  for _i in $(seq 1 30); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "[FAIL] $name not ready: $url" >&2
  return 1
}

echo "[1/5] prometheus ready"
wait_ready "prometheus" "http://127.0.0.1:9090/-/ready"

echo "[2/5] loki ready"
wait_ready "loki" "http://127.0.0.1:3100/ready"

echo "[3/5] grafana health"
wait_ready "grafana" "http://127.0.0.1:3001/api/health"

echo "[4/5] alertmanager ready"
wait_ready "alertmanager" "http://127.0.0.1:9093/-/ready"

echo "[5/5] prometheus rules loaded"
curl -fsS http://127.0.0.1:9090/api/v1/rules | grep -q "barbergo-slo"

echo "[SUCCESS] observability stack health checks passed"
