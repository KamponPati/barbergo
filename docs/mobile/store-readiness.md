# Mobile Store Readiness (Phase 8)

Last updated: 2026-02-16

## Build and Versioning

- App config: `apps/mobile/app.json`
- EAS config: `apps/mobile/eas.json`
- Current app version: `0.1.0`
- Release strategy:
  - Internal QA: `eas build --profile preview`
  - Production candidate: `eas build --profile production`
  - Auto increment enabled for production builds.

## Identity and Linking

- App name: `BarberGo Mobile`
- Slug: `barbergo-mobile`
- Deep link scheme: `barbergo://`
- Deep link routes in app:
  - `barbergo://customer`
  - `barbergo://partner`
  - `barbergo://admin`

## Notifications

- Client scaffold uses `expo-notifications`
- Permissions are requested at app start.
- Expo push token is collected and can be registered to backend.
- Backend registration endpoint:
  - `POST /api/v1/platform/devices/register`
- Backend list endpoint (ops/debug):
  - `GET /api/v1/platform/devices`

## Privacy and Permission Copy (Draft)

- We request notification permission to send booking and service status updates.
- We do not require location permission in current mobile baseline.
- We do not require contacts, camera, or microphone in current mobile baseline.

Suggested in-store privacy notes:
- Purpose of notifications: booking status, reminders, and service updates.
- Data used: account id, role, and push token.
- Data retention: push tokens can be revoked by logout/device reset.

## QA Checklist Before Submission

- Login by all roles works on real device.
- Customer flow works end-to-end:
  - load shops
  - availability
  - checkout
  - history
  - post-service/dispute
- Partner flow works end-to-end:
  - queue operations
  - onboarding actions
  - wallet/withdraw actions
- Admin flow works end-to-end:
  - snapshot
  - disputes
  - policy
- Deep links open correct role tab.
- Push notification permission prompt behaves correctly.
- App icons/splash render correctly on Android and iOS.
