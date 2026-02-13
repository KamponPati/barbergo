# Phase 1 Setup Guide

## Local prerequisites

1. Node.js 22 LTS
2. pnpm 10+
3. Docker and Docker Compose
4. Configure git hooks path: `git config core.hooksPath .githooks`

## Run infra

```bash
cd infra/docker
docker compose up -d
```

## Run observability stack (optional but recommended)

```bash
cd infra/docker
docker compose -f docker-compose.observability.yml up -d
```

## Check readiness

```bash
./scripts/check-dev-readiness.sh
```

## Install and run API

```bash
pnpm install
pnpm --filter @barbergo/api exec prisma generate
pnpm --filter @barbergo/api start:dev
```

## API quick checks

1. Swagger docs: `http://localhost:3000/docs`
2. Health live: `http://localhost:3000/health/live`
3. Metrics: `http://localhost:3000/metrics`
4. Realtime namespace: `/realtime` (Socket.IO)

## Validate baseline

1. Postgres: `localhost:5432`
2. Redis: `localhost:6379`
3. MinIO console: `http://localhost:9001`
4. Prometheus: `http://localhost:9090`
5. Grafana: `http://localhost:3001`
