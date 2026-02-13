# Phase 3 Daily Reconciliation Runbook

## Objective
Ensure daily consistency between payment gateway and internal settlement ledger.

## Inputs
- Gateway export CSV: `docs/ops/phase3/data/gateway_payments.csv`
- Internal export CSV: `docs/ops/phase3/data/internal_ledger.csv`

## Execution
Run:

```bash
scripts/phase3/generate-reconciliation-report.sh \
  docs/ops/phase3/data/gateway_payments.csv \
  docs/ops/phase3/data/internal_ledger.csv \
  2026-02-13 \
  docs/ops/phase3/reports/2026-02-13-reconciliation.md
```

## Acceptance
- Mismatch count must be 0 for full pass.
- Any mismatch requires incident ticket and same-day resolution owner.
