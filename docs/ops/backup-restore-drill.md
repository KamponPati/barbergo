# Backup and Restore Drill Baseline (RPO/RTO)

Version: 1.0
Date: 2026-02-12

## Targets

1. RPO: <= 15 minutes
2. RTO: <= 60 minutes

## Scope

1. PostgreSQL primary data
2. Redis persistent data (AOF)
3. MinIO object data

## Drill Cadence

1. Monthly in staging
2. Quarterly full simulation with incident timeline

## Drill Procedure

1. Trigger snapshot backup (DB + Redis + MinIO)
2. Validate backup artifacts and checksums
3. Provision clean restore environment
4. Restore DB, Redis, MinIO data
5. Run smoke checks (`/health/ready`, booking read path, auth flow)
6. Record elapsed restore time and data gap

## Evidence Checklist

1. Backup file references
2. Restore logs
3. Validation test results
4. RPO/RTO measured values
5. Follow-up action items
