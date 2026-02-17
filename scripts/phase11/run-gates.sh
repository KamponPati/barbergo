#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/artifacts/phase11}"
MODE="${1:-all}"

mkdir -p "$OUT_DIR"

run_quality() {
  echo "[phase11] quality gate" | tee "$OUT_DIR/quality.log"
  (cd "$ROOT_DIR" && corepack pnpm --filter @barbergo/api lint) 2>&1 | tee -a "$OUT_DIR/quality.log"
  (cd "$ROOT_DIR" && corepack pnpm --filter @barbergo/api test) 2>&1 | tee -a "$OUT_DIR/quality.log"
  (cd "$ROOT_DIR" && corepack pnpm --filter @barbergo/api build) 2>&1 | tee -a "$OUT_DIR/quality.log"
  (cd "$ROOT_DIR" && corepack pnpm --filter @barbergo/web lint) 2>&1 | tee -a "$OUT_DIR/quality.log"
  (cd "$ROOT_DIR" && corepack pnpm --filter @barbergo/web build) 2>&1 | tee -a "$OUT_DIR/quality.log"
}

run_migration() {
  echo "[phase11] migration safety gate" | tee "$OUT_DIR/migration.log"
  (cd "$ROOT_DIR" && bash scripts/release/check-migration-safety.sh) 2>&1 | tee -a "$OUT_DIR/migration.log"
}

run_smoke_local() {
  echo "[phase11] local smoke gate" | tee "$OUT_DIR/smoke.log"
  API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:3000/api/v1}" WEB_BASE_URL="${WEB_BASE_URL:-http://127.0.0.1:5173}" \
    bash "$ROOT_DIR/scripts/staging/smoke-critical-journeys.sh" 2>&1 | tee -a "$OUT_DIR/smoke.log"
}

case "$MODE" in
  quality)
    run_quality
    ;;
  migration)
    run_migration
    ;;
  smoke)
    run_smoke_local
    ;;
  all)
    run_quality
    run_migration
    ;;
  *)
    echo "Usage: $0 [quality|migration|smoke|all]" >&2
    exit 2
    ;;
esac

echo "[phase11] gate mode '$MODE' completed" | tee -a "$OUT_DIR/summary.log"
