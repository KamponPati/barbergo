# Secret and Environment Policy (Dev/Stage/Prod)

Version: 1.0
Date: 2026-02-12

## Rules

1. Never commit real secrets to repository.
2. Keep only example templates in source control: `.env.example`, `.env.staging.example`, `.env.production.example`.
3. Use per-environment secret injection in CI/CD.
4. Rotate JWT and integration secrets on schedule.

## Required Environment Variables

1. `JWT_SECRET`
2. `DATABASE_URL`
3. `REDIS_URL`
4. `MINIO_ACCESS_KEY`
5. `MINIO_SECRET_KEY`
6. `MINIO_BUCKET`

## Handling

1. Local dev: use `.env` generated from `.env.example`
2. Staging: use `.env.staging.example` as variable contract, inject real values from CI secrets manager
3. Production: use `.env.production.example` as variable contract, inject real values from CI secrets manager
3. Access control: only authorized maintainers can update runtime secrets
