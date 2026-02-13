#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATIONS_DIR="${1:-$ROOT_DIR/apps/api/prisma/migrations}"

echo "[INFO] checking migration safety at: $MIGRATIONS_DIR"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "[WARN] no migrations directory found, skipping destructive SQL checks"
  exit 0
fi

if ! compgen -G "$MIGRATIONS_DIR/**/migration.sql" >/dev/null 2>&1; then
  echo "[INFO] no migration.sql files found"
  exit 0
fi

blocked_regex='DROP[[:space:]]+TABLE|DROP[[:space:]]+COLUMN|TRUNCATE[[:space:]]+TABLE|ALTER[[:space:]]+TABLE.*DROP[[:space:]]+CONSTRAINT'
failed=0

while IFS= read -r file; do
  if grep -Eiq "$blocked_regex" "$file"; then
    echo "[ERROR] destructive statement detected in $file"
    failed=1
  fi
done < <(find "$MIGRATIONS_DIR" -type f -name "migration.sql" | sort)

if [ "$failed" -ne 0 ]; then
  echo "[FAIL] migration safety check failed"
  exit 1
fi

echo "[OK] migration safety check passed"
