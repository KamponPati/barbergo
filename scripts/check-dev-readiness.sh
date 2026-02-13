#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker is not installed"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] docker compose is not available"
  exit 1
fi

echo "[INFO] Checking infrastructure containers..."
if ! docker compose -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
  echo "[ERROR] docker compose stack is not running. Start with:"
  echo "  cd infra/docker && docker compose up -d"
  exit 1
fi

check_port() {
  local host="$1"
  local port="$2"
  local name="$3"

  if (echo >"/dev/tcp/$host/$port") >/dev/null 2>&1; then
    echo "[OK] $name reachable at $host:$port"
  else
    echo "[ERROR] $name not reachable at $host:$port"
    return 1
  fi
}

check_port localhost 5432 postgres
check_port localhost 6379 redis
check_port localhost 9000 minio
check_port localhost 9001 minio-console

echo "[INFO] Checking Node toolchain..."
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] node is not installed"
  exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[ERROR] pnpm is not installed"
  exit 1
fi

echo "[OK] node version: $(node -v)"
echo "[OK] pnpm version: $(pnpm -v)"

echo "[SUCCESS] Dev readiness checks passed"
