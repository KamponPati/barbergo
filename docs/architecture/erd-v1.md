# BarberGo ERD v1 (Freeze Candidate)

Version: 1.0-rc1
Date: 2026-02-12
Status: Freeze Candidate

## Domains

1. Identity
2. Partner
3. Customer
4. Booking
5. Payment/Settlement
6. Trust

## Core Entities

### Identity

- users(id PK, role, status, created_at, updated_at)
- user_auth_providers(user_id FK->users.id, provider, provider_user_id, metadata_json)

### Partner

- partner_shops(id PK, legal_name, display_name, owner_user_id FK->users.id, verification_status, rating_avg, created_at)
- shop_branches(id PK, shop_id FK->partner_shops.id, branch_name, address_text, lat, lng, open_hours_json, capacity, is_active)
- shop_staff(id PK, shop_id FK->partner_shops.id, branch_id FK->shop_branches.id, user_id FK->users.id NULL, display_name, is_active)
- shop_services(id PK, shop_id FK->partner_shops.id, branch_id FK->shop_branches.id NULL, name, duration_minutes, price, mode_supported)
- staff_service_skills(staff_id FK->shop_staff.id, service_id FK->shop_services.id, skill_level)

### Customer

- customers(id PK, user_id FK->users.id, display_name, phone)
- customer_addresses(id PK, customer_id FK->customers.id, label, address_text, lat, lng, access_note)

### Booking

- bookings(id PK, booking_no UNIQUE, customer_id FK->customers.id, shop_id FK->partner_shops.id, branch_id FK->shop_branches.id, staff_id FK->shop_staff.id, service_id FK->shop_services.id, booking_mode, service_address_id FK->customer_addresses.id NULL, scheduled_start_at, scheduled_end_at, state, total_price, cancel_reason, created_at, updated_at)
- booking_events(id PK, booking_id FK->bookings.id, event_type, payload_json, actor_user_id FK->users.id NULL, created_at)

### Payment/Settlement

- payments(id PK, booking_id FK->bookings.id UNIQUE, amount_total, method, status, provider_ref, authorized_at, captured_at)
- shop_wallets(id PK, shop_id FK->partner_shops.id UNIQUE, available_balance, pending_balance)
- wallet_ledger(id PK, wallet_id FK->shop_wallets.id, booking_id FK->bookings.id NULL, entry_type, amount, balance_after, created_at)
- withdrawal_requests(id PK, shop_id FK->partner_shops.id, amount, status, processed_at)

### Trust

- reviews(id PK, booking_id FK->bookings.id UNIQUE, customer_id FK->customers.id, shop_id FK->partner_shops.id, staff_id FK->shop_staff.id NULL, rating, comment, created_at)
- disputes(id PK, booking_id FK->bookings.id, raised_by_user_id FK->users.id, category, description, status, resolution_type, refund_amount, resolved_at)
- partner_documents(id PK, shop_id FK->partner_shops.id, doc_type, file_url, review_status, reviewed_by FK->users.id NULL, reviewed_at)

## Key Constraints

1. `bookings.booking_no` must be globally unique.
2. One `payments` row per `bookings` row for baseline flow.
3. One `reviews` row per completed booking.
4. `service_address_id` is nullable for in-shop mode.

## Index Recommendations (v1)

1. `bookings(state, scheduled_start_at)`
2. `bookings(branch_id, scheduled_start_at)`
3. `booking_events(booking_id, created_at)`
4. `payments(status, captured_at)`
5. `disputes(status, resolved_at)`

## Change Log

- v1.0-rc1: Initial ERD freeze candidate drafted from `New_Project.md` v3.1.
