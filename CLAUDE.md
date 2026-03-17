# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BarberGo** — a two-sided grooming marketplace (like ride-hailing, but for barbershop bookings). Three user roles: **customer**, **partner** (barbershop owner/staff), **admin**.

## Channel Architecture

| Channel | Platform | App | สถานะ |
|---------|----------|-----|-------|
| **Customer** | Mobile app (iOS + Android) | `apps/mobile` — React Native + Expo | In progress |
| **Partner** | Mobile app (iOS + Android) | `apps/mobile` — React Native + Expo | In progress |
| **Admin** | Web browser | `apps/web` — React + Vite | Done (Phase 12) |

> `apps/web` เป็น Admin console หลัก — Customer/Partner web pages ที่มีอยู่ใช้สำหรับ development reference และ internal testing เท่านั้น ไม่ใช่ production channel

## Repository Structure

pnpm monorepo with three apps:

| App | Path | Stack | Port |
|-----|------|-------|------|
| Web (Admin console) | `apps/web/` | React 18 + Vite + TypeScript | 5173 |
| REST API | `apps/api/` | NestJS 10 + Prisma + PostgreSQL | 3000 |
| Mobile (Customer + Partner) | `apps/mobile/` | React Native + Expo | — |

## Commands

### Local Infrastructure (required before running API)
```bash
docker compose -f infra/docker/docker-compose.yml up -d   # Start postgres, redis, minio
```

### Web
```bash
pnpm --filter @barbergo/web dev       # Dev server at http://localhost:5173
pnpm --filter @barbergo/web build     # TypeScript check + Vite build
pnpm --filter @barbergo/web lint      # tsc --noEmit only (no ESLint currently)
```

### API
```bash
pnpm --filter @barbergo/api start:dev    # ts-node dev server
pnpm --filter @barbergo/api build        # tsc compile to dist/
pnpm --filter @barbergo/api start        # Run compiled dist/main.js
pnpm --filter @barbergo/api start:worker # Run compiled dist/worker.js (BullMQ)
pnpm --filter @barbergo/api test         # Jest (all tests in apps/api/test/)
pnpm --filter @barbergo/api lint         # ESLint src + test
pnpm --filter @barbergo/api format       # Prettier check
```

### Running a single API test file
```bash
cd apps/api && npx jest test/path/to/file.spec.ts
```

### Database (run from apps/api/)
```bash
pnpm --filter @barbergo/api exec prisma migrate dev    # Apply migrations
pnpm --filter @barbergo/api exec prisma db seed        # Seed data (ts-node prisma/seed.ts)
pnpm --filter @barbergo/api exec prisma studio         # GUI browser
```

### Mobile
```bash
pnpm --filter @barbergo/mobile start     # Expo dev server
pnpm --filter @barbergo/mobile android   # Android
pnpm --filter @barbergo/mobile ios       # iOS
```

### Workspace-wide
```bash
pnpm build    # Build all apps
pnpm lint     # Lint all apps
pnpm test     # Test all apps
pnpm format   # Format check all apps
```

### Git hooks
```bash
git config core.hooksPath .githooks   # Enable pre-commit hook (runs lint + test)
```

## Environment Setup

Copy `.env.example` to `.env` and fill in secrets. Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — change from default `"change-me"`
- MinIO, payment provider, push provider credentials

## Business Domain

### Core Concept

BarberGo is a **two-sided marketplace**: customers book barbershop appointments (like ride-hailing, but for grooming). Launch strategy is **In-Shop mode first**, Delivery mode added after KPI stability.

### Booking State Machine (from Product Requirement)

The Prisma schema uses a simplified set; the full product-level states are:

```
draft → pending_payment → paid_authorized → confirmed → in_progress → completed
                                                      ↘ cancelled_by_customer
                                                      ↘ cancelled_by_partner
                                                      ↘ no_show → disputed → refunded_partial / refunded_full
```

### Payment Lifecycle

`authorize` (at booking) → `capture` (at service completion) → `refund` (by policy or dispute outcome)

### Cancellation Policy

- Free cancellation before threshold
- Partial fee for late cancellation
- No-show fee logic
- Partner late-cancel penalty
- Admin can override for exceptional cases

### Slot / Capacity Rules

Slot reservation must be **transactional** to prevent race conditions. A slot is valid only when it respects: branch open hours, staff shift/break, and branch capacity.

### Partner KYC

Partners must pass KYC (`PartnerVerificationStatus: pending → approved | rejected`) before going live. Admin controls this via `/admin/partners/{id}/approve|reject`.

### Trust & Safety

Violation matrix for partners: warning → temporary suspension → permanent delisting.
Violation matrix for customers: warning → temporary block → permanent block.

### North Star KPI

**Weekly Completed Bookings (WCB)**. Supporting metrics: completion rate, complaint rate, refund rate, slot utilization, time-to-confirm, GMV, contribution margin.

### Compliance

PDPA consent logging required. Audit logs for all privileged actions. Sensitive documents (partner KYC files) require restricted access.

## Architecture

### API (`apps/api/src/`)

All domain modules import `CommonModule` to access shared services. The global middleware chain is applied in `app.module.ts`:

```
RequestContext → Metrics → RequestLogging → Idempotency → AuditLog
```

**Modules:** `auth`, `discovery`, `booking`, `payment`, `settlement`, `trust`, `admin`, `platform`

**CommonModule services** (available to all modules via import):
`PrismaService`, `DbCoreService`, `MvpCoreService`, `RedisService`, `BullmqService`, `MinioService`, `AuditLogService`, `IdempotencyService`, `PaymentGatewayService`, `PushProviderService`, `MetricsService`

**API prefix:** `api/v1/*` — exceptions: `health/live`, `health/ready`, `metrics`, `docs`, `docs-json`

**Swagger docs:** available at `/docs` when running locally.

**Auth:** JWT Bearer token. Roles are `customer | partner | admin` (defined in Prisma schema `UserRole` enum). Use `JwtAuthGuard` + `RolesGuard` decorators on controllers.

**Booking state machine:** `requested → quoted → authorized → confirmed → started → completed` (also `cancelled`, `disputed`)

**Payment states:** `authorized → captured → refunded`

### Web (`apps/web/src/`)

**Two layout trees:**
- `PublicLayout` — wraps `/marketing/*`, `/legal/*`, `/support`, `/login`, `/forbidden`
- `AppShellLayout` — wraps `/app/*` (authenticated, sidebar + topbar)

**Route protection** via `RoleGuard` (outlet-based):
- `/app/customer` — customer + admin
- `/app/partner` — partner + admin
- `/app/admin` — admin only

**Auth state** is stored in `localStorage` under key `barbergo_auth` (`{ role, token }`). The `useAuth()` hook provides `loginAs(role)` and `logout()`.

**i18n:** `I18nContext` supports `th-TH` (default) and `en-US`. Use the `label(th, en)` helper everywhere user-facing text appears. Currency: THB, timezone: `Asia/Bangkok`. Locale is persisted in `localStorage` under `barbergo_locale`.

**Shared UI components** live in `features/shared/`:
- `UiKit.tsx` — `UiButton`, `Chip`, `UiBadge`, `StatCard`, `UiModal`
- `FormControls.tsx`, `DataTable.tsx`, `Tabs.tsx`, `Skeleton.tsx`, `Toast.tsx`, `UiState.tsx`, `PageSection.tsx`

### Mobile (`apps/mobile/src/`)

React Native + Expo app รองรับ 2 roles ใน binary เดียวกัน — Customer และ Partner (แยก tab navigator ตาม role หลัง login)

**ที่มีอยู่แล้ว (scaffold):**
- `lib/api.ts` — API client ครบทุก endpoint (discovery, booking, partner ops, wallet, notifications)
- `lib/notifications.ts` — Expo push notification setup
- `screens/CustomerScreen.tsx` / `PartnerScreen.tsx` — scaffold พื้นฐาน (ยังไม่ครบ ต้อง build ใหม่)
- `theme.ts` — design tokens พื้นฐาน

**สิ่งที่ยังขาด (Phase 13–14):**
- React Navigation (bottom tabs + stack)
- expo-location, expo-secure-store
- Zustand global state
- UI screens ครบทุก flow ของทั้ง Customer และ Partner

## Git Conventions

**Branch format:** `feature/<scope>-<short-name>`, `fix/<scope>-<short-name>`, `chore/<scope>-<short-name>`

**Commit format:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`

`main` is the protected branch.
