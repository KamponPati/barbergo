# UI Inventory (Phase 10A)

Last updated: 2026-02-16
Owner: Codex

## Scope

- Web app (public + role-based)
- Mobile app (Expo, role-based tabs)
- Shared component systems used in production routes

## Route and Screen Inventory

### Web - Public

- `/marketing`
- `/marketing/partner`
- `/marketing/faq`
- `/marketing/pricing`
- `/marketing/contact`
- `/legal/terms`
- `/legal/privacy`
- `/legal/cookie`
- `/legal/policy`
- `/support`
- `/login`
- `/forbidden`

### Web - Role Core

- `/customer`
- `/partner`
- `/admin`

### Mobile - Role Screens

- `CustomerScreen`
- `PartnerScreen`
- `AdminScreen`

## Shared UI Components in Active Use

- `UiButton`
- `Chip`
- `UiBadge`
- `StatCard`
- `UiModal`
- `UiDrawer`
- `PageSection`
- `Tabs`
- `DataTable`
- `Field/Input/Select`
- `Toast`
- `SkeletonRows`
- `StatusLine`
- `ErrorBanner`
- `EmptyHint`

## Critical UI State Matrix (Current Coverage)

- Loading state: present on role pages
- Empty state: present on queue/history/public data sections
- Error state: present with API error text rendering
- Success feedback: present via status line/toast
- Forbidden state: explicit page and guard redirect
- Auth role mismatch feedback: present (403 + role constraints)

## UX Risk Ranking (High -> Medium)

1. Partner operational transitions (confirm/start/complete sequencing)
2. Customer slot booking conflict/availability refresh path
3. Admin dense JSON readability for non-technical users
4. Public marketing conversion clarity between landing -> partner/contact
5. Mobile deep-link/session role switching context persistence

## Priority Backlog Input for 10B+

- Prioritize hierarchy/affordance refinements on:
  - Partner operations actions
  - Customer checkout/post-service block
  - Admin summary cards before debug JSON blocks
- Add contextual helper copy in action-heavy views before motion polish.
