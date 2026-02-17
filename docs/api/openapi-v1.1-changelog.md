# BarberGo API v1.1 Changelog

Date: 2026-02-17
Scope: Contract freeze update for production-closure Phase 11.

## Added

- `GET /auth/me/profile`
  - Returns normalized user profile for current authenticated principal.
  - Fields: `user_id`, `role`, `display_name`, `status`, `locale`, `time_zone`.
- `GET /auth/me/settings`
  - Returns user-level preferences persisted in DB.
  - Fields: `locale`, `time_zone`, `email_alerts`, `push_alerts`, `compact_mode`.
- `PUT /auth/me/settings`
  - Updates current user preferences.
  - Supports partial updates on locale/timezone/alert flags/compact mode.

## Updated

- OpenAPI `info.version` changed from `1.0.0-rc2` to `1.1.0`.
- Added schemas:
  - `UserProfileResponse`
  - `UserSettingsResponse`
  - `UpdateUserSettingsRequest`

## Backward Compatibility Notes

- Existing customer/partner/admin paths remain unchanged.
- Existing JWT auth behavior remains unchanged.
- New endpoints are additive and non-breaking.
