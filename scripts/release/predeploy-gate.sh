#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[INFO] predeploy gate started"

cd "$ROOT_DIR"
corepack pnpm lint
corepack pnpm test
corepack pnpm build

"$ROOT_DIR/scripts/release/check-migration-safety.sh"

echo "[SUCCESS] predeploy gate passed"
