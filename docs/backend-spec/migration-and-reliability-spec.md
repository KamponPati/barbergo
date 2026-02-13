# Phase 1 Migration and Reliability Spec

Version: 1.0-draft
Date: 2026-02-12

## 1) Migration Strategy (Prisma + SQL)

1. Use Prisma schema as source-of-truth for model evolution.
2. Keep migration files immutable after merge.
3. Run migrations in CI against ephemeral database before deploy.
4. Use forward-only migration policy; no destructive rollback in production.

### 1.1 Migration Flow

1. Update `apps/api/prisma/schema.prisma`
2. Generate migration (`prisma migrate dev` in local)
3. Review SQL output for constraints/indexes
4. Apply in staging and validate queries
5. Promote to production via controlled release window

### 1.2 Naming Convention

- `YYYYMMDDHHMM_<domain>_<change>`
- Example: `202602121030_booking_add_state_index`

### 1.3 Required DB Guarantees

1. Booking uniqueness by `booking_no`
2. One payment row per booking baseline
3. Atomic wallet ledger posting for settlement events
4. Foreign key consistency across booking and trust events

---

## 2) Idempotency Framework (Booking/Payment Writes)

### 2.1 Scope

Required on endpoints that mutate booking/payment/dispute state:

1. `POST /customer/bookings/quote`
2. `POST /customer/bookings`
3. `POST /customer/bookings/{id}/cancel`
4. `POST /partner/bookings/{id}/confirm`
5. `POST /partner/bookings/{id}/start`
6. `POST /partner/bookings/{id}/complete`
7. `POST /admin/disputes/{id}/resolve`

### 2.2 Header Contract

- Header: `Idempotency-Key` (required)
- TTL: 24 hours (configurable)
- Key uniqueness scope: `actor_id + route + key`

### 2.3 Storage Model

`idempotency_keys`

1. key
2. actor_id
3. route
4. request_hash
5. response_status
6. response_body
7. created_at
8. expires_at

### 2.4 Processing Rules

1. If key not found: process request and persist response snapshot.
2. If key found with same request hash: return stored response.
3. If key found with different request hash: return `409 IDEMPOTENCY_CONFLICT`.
4. On internal timeout/error before commit: safe retry allowed with same key.

---

## 3) Unified Error Schema

### 3.1 Response Format

```json
{
  "code": "BOOKING_SLOT_CONFLICT",
  "message": "Requested slot is no longer available",
  "request_id": "req_01JXXXX",
  "details": {
    "field": "scheduled_start_at",
    "reason": "conflict"
  }
}
```

### 3.2 Error Code Buckets

1. `AUTH_*` authentication/authorization failures
2. `VALIDATION_*` payload/schema failures
3. `BOOKING_*` booking state or slot conflicts
4. `PAYMENT_*` authorization/capture/refund errors
5. `PARTNER_*` partner operation constraints
6. `ADMIN_*` admin policy/dispute processing errors
7. `SYSTEM_*` infrastructure/unexpected errors

### 3.3 Request ID Rules

1. Every request gets `request_id` at gateway or app middleware.
2. `request_id` is included in logs, traces, and error responses.
3. Correlation between `request_id` and event/audit entries is mandatory.

---

## 4) Reliability Baselines

1. Retry policy for transient dependency failures (max 3 retries, jitter backoff)
2. Dead-letter queue for non-recoverable async jobs
3. Timeout budget per external call (payment provider, storage)
4. Health endpoints: `/health/live`, `/health/ready`, `/metrics`
5. Backup/restore drill cadence: monthly simulation in staging

### 4.1 Event Bus and Dead-Letter Baseline

1. Domain event abstraction implemented via `EventBusService` publish/subscribe API.
2. Local in-memory subscriber dispatch is used in Phase 1 baseline.
3. Failed handlers are pushed to BullMQ queue `dead-letter-events`.
4. Dead-letter payload includes `event_name`, `occurred_at`, `request_id`, and `error_message`.
5. Admin/ops replay tooling is deferred to later phase.

## 5) Acceptance Criteria (Phase 1)

1. Migration process documented and reviewable.
2. Idempotency requirements mapped to write endpoints.
3. Error schema standardized and referenced in OpenAPI.
4. Reliability controls mapped to implementation backlog.
