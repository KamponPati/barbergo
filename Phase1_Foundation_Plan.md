# BarberGo Phase 1 Foundation Plan

Version: 1.0-draft  
Date: 2026-02-12  
Scope Window: S1-W1 to S1-W3 (2026-03-02 to 2026-03-20)  
Execution Mode: Pre-kickoff preparation started on 2026-02-12

References:

1. `New_Project.md` v3.1
2. `task.md` (Phase 1 section)
3. `Phase0_Freeze_Candidate.md` v1.0-rc1

---

## 1) Objectives

1. Establish runnable local foundation stack for backend development.
2. Freeze ERD v1 and API v1 contract before core feature implementation.
3. Lock baseline for auth, observability, CI/CD, and reliability controls.
4. Exit Phase 1 with clear readiness gate for Phase 2 MVP build.

---

## 2) Wave 1 Sequencing

### 2.1 Track A: Environment and Tooling

1. Git workflow and commit hooks
2. Docker + Docker Compose local runtime
3. Node.js 22 LTS + pnpm toolchain
4. NestJS + TypeScript service scaffold
5. PostgreSQL 16 + PostGIS + Prisma
6. Redis + BullMQ baseline

### 2.2 Track B: Architecture Foundations

1. Modular monolith repository structure
2. ERD v1 freeze from logical model
3. API v1 freeze (customer/partner/admin)
4. Unified error schema and request tracing baseline
5. Idempotency framework for booking/payment write paths

### 2.3 Track C: Platform Baselines

1. JWT + RBAC baseline
2. Test stack (Jest + Supertest + test DB)
3. Observability baseline (OpenTelemetry + Prometheus + Grafana + Loki)
4. CI/CD baseline (build/lint/test/deploy preview)
5. Backup/restore drill plan and RPO/RTO baseline

---

## 3) Environment Baseline Matrix (Target)

| Area | Target | Status |
|---|---|---|
| Source control | Git + branching convention + hooks | Planned |
| Runtime | Node.js 22 LTS + pnpm | Planned |
| App framework | NestJS + TypeScript | Planned |
| Database | PostgreSQL 16 + PostGIS + Prisma | Planned |
| Cache/queue | Redis + BullMQ | Planned |
| API docs | OpenAPI/Swagger | Planned |
| Realtime | Socket.IO or WS adapter | Planned |
| Object storage (dev) | MinIO | Planned |
| Testing | Jest + Supertest | Planned |
| Observability | OTel + Prometheus + Grafana + Loki | Planned |
| Delivery | GitHub Actions CI/CD | Planned |

---

## 4) ERD v1 Freeze Candidate Scope

1. Identity: users, auth providers
2. Partner domain: shops, branches, staff, services, skills
3. Customer domain: customer profile, addresses
4. Booking domain: bookings, booking events
5. Payment/settlement: payments, wallets, ledger, withdrawals
6. Trust domain: reviews, disputes, partner documents

Freeze criteria:

1. Primary/foreign keys and nullable constraints defined.
2. Booking/payment critical indexes specified.
3. Change log entry recorded for each model delta.

---

## 5) API v1 Freeze Candidate Scope

1. Customer APIs: nearby/discovery, availability, booking, cancel, review
2. Partner APIs: onboarding, profile, branches/services/staff, booking ops, wallet
3. Admin APIs: partner approval, disputes, policy controls, analytics overview

Contract criteria:

1. Request/response schema complete with error schema.
2. Authentication/authorization requirement mapped per endpoint.
3. Idempotency required on booking/payment write endpoints.
4. Breaking changes prohibited after freeze without review gate.

---

## 6) Risk Register (Phase 1 Start)

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| Delayed ERD/API freeze | Blocks Phase 2 features | Run daily schema/API review cadence in S1-W1 | Engineering |
| Toolchain drift across dev machines | Slows onboarding and CI parity | Enforce Dockerized baseline and version pinning | Engineering |
| Missing observability early | Harder root-cause analysis | Add OTel/logging before core flow implementation | Engineering |
| Policy-contract mismatch | Rework in booking/payment logic | Traceability matrix from policy -> API/DB rules | Product + Engineering |

---

## 7) Readiness Gate for Phase 1 Completion

1. Environment stack bootstrapped and reproducible.
2. ERD v1 and API v1 frozen with approval note.
3. CI pipeline runs build/lint/test successfully.
4. Baseline auth, idempotency, and error schema documented.
5. Observability and backup/restore baseline documented.
