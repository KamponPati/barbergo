# BarberGo - New Project Master Plan

Version: 3.1
Last Updated: 2026-02-12
Project Type: New Product (not a migration)

---

## 0. One-Page Summary

BarberGo is a two-sided grooming marketplace:

1. Customer App (smartphone): discover nearby barbershops, compare, book, pay, review
2. Partner App (shop/barber): onboard, manage branches/services/staff, accept jobs, operate, get paid
3. Admin Web: governance, quality, disputes, policy, analytics

Business direction:

1. Any barbershop can become a BarberGo partner
2. Customers can search nearby shops and choose by quality, price, and availability
3. Launch with In-Shop booking first, then expand to Delivery mode

---

## 1. Project Charter (New Project)

## 1.1 Problem Statement

1. Customers waste time finding trusted barbershops and available slots
2. Shops struggle with demand consistency and operational visibility
3. Market lacks a strong trust layer with standardized quality controls

## 1.2 Vision

Make haircut booking as easy as ride-hailing, with strong trust, quality, and operational reliability.

## 1.3 12-Month Objectives

1. Reach sustainable weekly completed bookings in pilot city
2. Build repeat customer behavior
3. Build stable partner supply with acceptable quality KPIs
4. Maintain healthy unit economics trend

## 1.4 Non-Goals (Phase 1)

1. Nationwide rollout
2. Full AI personalization
3. Enterprise white-label architecture
4. Full subscription stack

---

## 2. Product Scope

## 2.1 Launch Scope (MVP)

1. Customer nearby shop search and in-shop booking
2. Partner onboarding and branch/service/staff management
3. Payment authorization/capture/refund baseline
4. Ratings/reviews and basic dispute handling
5. Admin partner approval and policy control

## 2.2 Post-MVP Scope

1. Delivery mode optimization
2. Dynamic pricing upgrades
3. Loyalty/referral
4. AI lookbook
5. Boost listing and advanced ad products

---

## 3. Product Channels

## 3.1 Customer App (iOS/Android)

1. Sign in and profile
2. Discover nearby shops
3. Compare shops and services
4. Book and pay
5. Track booking status
6. Rate and review

## 3.2 Partner App (iOS/Android)

1. Partner registration and KYC
2. Shop and branch setup
3. Staff and service management
4. Booking operations
5. Revenue and payout

## 3.3 Admin Web

1. Partner verification and governance
2. Disputes and risk operations
3. Policy engine (commission, cancellation, pricing)
4. Marketplace analytics and SLA monitoring

---

## 4. Marketplace Service Modes

## 4.1 In-Shop Booking (Phase 1 Priority)

Customer goes to selected branch at selected time.

## 4.2 Delivery Booking (Phase 2+)

Barber goes to customer location with travel and safety constraints.

Mode strategy:

1. Start with In-Shop for stability and density
2. Add Delivery after operational KPIs are stable

---

## 5. User Roles and Permissions

## 5.1 Customer

1. Search, book, pay, cancel
2. Review and dispute

## 5.2 Shop Owner/Manager

1. Manage shop profile, branches, staff, services, pricing
2. Manage incoming bookings and operations

## 5.3 Barber Staff

1. Manage shifts/availability
2. Accept/start/complete service tasks

## 5.4 Admin/Ops

1. Approve partners and KYC
2. Resolve disputes and enforce policies
3. Configure marketplace settings

---

## 6. Feature Architecture

## 6.1 Customer App

### A. Discovery and Search

1. Nearby map and list view
2. Filters:
- distance
- open now
- rating
- price range
- service type
3. Sort:
- nearest
- best rated
- fastest available
- best value

### B. Shop and Branch Detail

1. Shop profile and gallery
2. Branch list and hours
3. Service catalog
4. Staff list with rating/portfolio
5. Review summary

### C. Booking and Payment

1. Select branch, service, staff, slot
2. Price summary breakdown
3. Pre-authorization and final capture
4. Cancellation handling by policy

### D. Post-Service

1. Rating and text review
2. Tip (optional)
3. Rebook quick action
4. Dispute ticket opening

## 6.2 Partner App

### A. Onboarding

1. Partner registration
2. Document upload and verification
3. Bank account setup

### B. Shop Operations

1. Create/edit branches
2. Configure open hours and capacity
3. Configure services (price and duration)
4. Manage staff and skill mapping

### C. Booking Operations

1. Incoming queue
2. Confirm/reject/reschedule
3. Start/complete service
4. Handle no-show and exceptions

### D. Finance

1. Revenue dashboard
2. Commission breakdown
3. Withdrawal requests

## 6.3 Admin Web

### A. Governance

1. Partner and KYC approvals
2. Role and permissions
3. Audit log

### B. Marketplace Controls

1. Commission configuration
2. Cancellation policy
3. Pricing/surge rules
4. Promotions

### C. Quality and Support

1. Dispute center
2. Penalty and suspension tools
3. SLA and support dashboards

---

## 7. End-to-End Flows

## 7.1 Customer In-Shop Flow

1. Open app and allow location
2. Search nearby shops
3. Select shop and branch
4. Select service and slot
5. Confirm and pay
6. Service completed at branch
7. Review and close

## 7.2 Customer Delivery Flow (Later)

1. Set service address
2. Select delivery-enabled partner
3. Select slot and pay
4. Track barber
5. Service complete
6. Review and close

## 7.3 Partner Booking Flow

1. Receive booking request
2. Validate capacity and staff
3. Confirm booking
4. Start service
5. Complete service
6. Revenue settlement lifecycle

## 7.4 Admin Quality Flow

1. Receive complaint
2. Collect evidence and timeline
3. Resolve refund/penalty
4. Apply quality action and monitor

---

## 8. Core Business Rules

## 8.1 Booking States

1. draft
2. pending_payment
3. paid_authorized
4. confirmed
5. in_progress
6. completed
7. cancelled_by_customer
8. cancelled_by_partner
9. no_show
10. disputed
11. refunded_partial
12. refunded_full

## 8.2 Capacity and Slot Rules

1. Slot must respect branch hours
2. Slot must respect staff shift and break
3. Slot must respect branch capacity
4. Slot conflicts are prevented transactionally

## 8.3 Cancellation Rules

1. Free cancellation before threshold
2. Partial fee for late cancellation
3. No-show fee logic
4. Partner late-cancel penalty
5. Admin override for exceptional cases

## 8.4 Nearby Ranking Rules

Ranking score uses:

1. distance
2. rating
3. price fit
4. slot availability speed
5. quality reliability (low cancel/high completion)

---

## 9. Data Model (Logical)

## 9.1 Identity

### users

1. id
2. role
3. status
4. created_at
5. updated_at

### user_auth_providers

1. user_id
2. provider
3. provider_user_id
4. metadata_json

## 9.2 Partner Domain

### partner_shops

1. id
2. legal_name
3. display_name
4. owner_user_id
5. verification_status
6. rating_avg
7. created_at

### shop_branches

1. id
2. shop_id
3. branch_name
4. address_text
5. lat
6. lng
7. open_hours_json
8. capacity
9. is_active

### shop_staff

1. id
2. shop_id
3. branch_id
4. user_id (optional)
5. display_name
6. is_active

### shop_services

1. id
2. shop_id
3. branch_id (nullable global)
4. name
5. duration_minutes
6. price
7. mode_supported

### staff_service_skills

1. staff_id
2. service_id
3. skill_level

## 9.3 Customer Domain

### customers

1. id
2. user_id
3. display_name
4. phone

### customer_addresses

1. id
2. customer_id
3. label
4. address_text
5. lat
6. lng
7. access_note

## 9.4 Booking Domain

### bookings

1. id
2. booking_no
3. customer_id
4. shop_id
5. branch_id
6. staff_id
7. service_id
8. booking_mode
9. service_address_id
10. scheduled_start_at
11. scheduled_end_at
12. state
13. total_price
14. cancel_reason
15. created_at
16. updated_at

### booking_events

1. id
2. booking_id
3. event_type
4. payload_json
5. actor_user_id
6. created_at

## 9.5 Payment and Settlement

### payments

1. id
2. booking_id
3. amount_total
4. method
5. status
6. provider_ref
7. authorized_at
8. captured_at

### shop_wallets

1. id
2. shop_id
3. available_balance
4. pending_balance

### wallet_ledger

1. id
2. wallet_id
3. booking_id
4. entry_type
5. amount
6. balance_after
7. created_at

### withdrawal_requests

1. id
2. shop_id
3. amount
4. status
5. processed_at

## 9.6 Quality and Trust

### reviews

1. id
2. booking_id
3. customer_id
4. shop_id
5. staff_id
6. rating
7. comment
8. created_at

### disputes

1. id
2. booking_id
3. raised_by_user_id
4. category
5. description
6. status
7. resolution_type
8. refund_amount
9. resolved_at

### partner_documents

1. id
2. shop_id
3. doc_type
4. file_url
5. review_status
6. reviewed_by
7. reviewed_at

---

## 10. API Blueprint

## 10.1 Standards

1. Base path: `/api/v1`
2. JWT auth and RBAC
3. Idempotency key for booking/payment write endpoints
4. Unified error schema with request_id

## 10.2 Customer APIs

1. `GET /customer/shops/nearby`
2. `GET /customer/shops/{shopId}`
3. `GET /customer/shops/{shopId}/branches`
4. `GET /customer/shops/{shopId}/services`
5. `GET /customer/availability`
6. `POST /customer/bookings/quote`
7. `POST /customer/bookings`
8. `GET /customer/bookings/{id}`
9. `POST /customer/bookings/{id}/cancel`
10. `POST /customer/bookings/{id}/review`

## 10.3 Partner APIs

1. `POST /partner/onboarding/submit`
2. `GET /partner/shop/profile`
3. `PUT /partner/shop/profile`
4. `POST /partner/branches`
5. `POST /partner/services`
6. `POST /partner/staff`
7. `POST /partner/bookings/{id}/confirm`
8. `POST /partner/bookings/{id}/start`
9. `POST /partner/bookings/{id}/complete`
10. `GET /partner/wallet/summary`
11. `POST /partner/wallet/withdraw`

## 10.4 Admin APIs

1. `GET /admin/partners/pending`
2. `POST /admin/partners/{id}/approve`
3. `POST /admin/partners/{id}/reject`
4. `GET /admin/disputes`
5. `POST /admin/disputes/{id}/resolve`
6. `POST /admin/policies/cancellation`
7. `POST /admin/pricing-rules`
8. `GET /admin/analytics/overview`

---

## 11. Realtime and Notifications

1. booking_created
2. booking_confirmed
3. service_started
4. service_completed
5. booking_cancelled
6. dispute_opened

Channels:

1. Push to customer app
2. Push to partner app
3. In-app timeline
4. Admin alert feed

---

## 12. Finance, Reconciliation, and Payout Controls

## 12.1 Payment Lifecycle

1. Authorize at booking
2. Capture at completion
3. Refund by policy or dispute outcome

## 12.2 Reconciliation

1. Daily gateway vs internal ledger reconciliation
2. Exception queue for mismatches
3. Manual review and closure process

## 12.3 Payout Governance

1. Settlement windows by partner level
2. Withdrawal checks and limits
3. Transfer failure retries and status tracking

---

## 13. Trust, Safety, and Compliance

## 13.1 Trust and Safety Policies

1. Partner KYC required before going live
2. Violation matrix:
- warning
- temporary suspension
- permanent delisting
3. Customer misuse matrix:
- warning
- temporary block
- permanent block

## 13.2 Legal Pack

1. Customer terms
2. Partner agreement
3. Privacy policy
4. Refund and cancellation policy

## 13.3 Compliance Checklist

1. PDPA consent logging
2. Data retention and deletion workflows
3. Restricted access to sensitive documents
4. Audit logs for privileged actions

---

## 14. KPI Framework and North Star

## 14.1 North Star

1. Weekly Completed Bookings (WCB)

## 14.2 Growth Metrics

1. MAU
2. New active partners
3. Search to booking conversion

## 14.3 Quality Metrics

1. Completion rate
2. Complaint rate
3. Refund rate
4. Repeat booking (D30/D60)

## 14.4 Efficiency Metrics

1. Time to confirm booking
2. On-time start rate
3. Slot utilization

## 14.5 Financial Metrics

1. GMV
2. Net revenue
3. Contribution margin trend

---

## 15. Non-Functional Requirements

1. API uptime target >= 99.9%
2. P95 latency target for nearby search
3. P95 latency target for booking confirm flow
4. Idempotent write paths for booking/payment
5. Event retry and dead-letter handling
6. Backup and restore drills with defined RPO/RTO
7. Security baseline:
- RBAC
- rate limiting
- encryption for sensitive data

---

## 16. Engineering Strategy

1. Start with modular monolith
2. Use clear domain modules:
- discovery
- booking
- payment
- settlement
- trust/disputes
- admin
3. Use contract-first API design
4. Add service extraction only when justified by scale/team boundaries
5. Add feature flags by city zone and partner tier

---

## 17. Experimentation Framework

1. A/B test ranking weights
2. A/B test cancellation thresholds
3. A/B test promotion mechanics

Rules:

1. Predefine hypothesis and metric
2. Minimum sample size before decision
3. Stop-loss criteria for negative impact

---

## 18. Detailed Roadmap

## Phase 0 - Discovery and Policy (2 weeks)

1. Freeze charter and non-goals
2. Freeze policy matrix and legal drafts
3. Finalize metric tree and reporting definitions
4. Finalize UX flows

## Phase 1 - Foundation (3 weeks)

1. ERD and API v1 freeze
2. Auth and RBAC baseline
3. Core modules scaffold
4. CI/CD and observability baseline

## Phase 2 - MVP Build (8 weeks)

1. Customer nearby search and in-shop booking
2. Partner onboarding and operations
3. Admin governance and disputes
4. Payment and settlement baseline

## Phase 3 - Pilot Launch (4 weeks)

1. Launch in limited zones
2. Activate support playbooks
3. KPI daily review and iteration

## Phase 4 - Scale (6-10 weeks)

1. Delivery mode expansion
2. Dynamic pricing and ranking optimization
3. Growth and retention modules

---

## 19. Backlog (Epic Level)

1. Epic A: Nearby Discovery and Shop Ranking
2. Epic B: Partner Onboarding and Shop Setup
3. Epic C: Booking and Slot Engine
4. Epic D: Payment, Wallet, and Reconciliation
5. Epic E: Reviews, Disputes, and Trust Controls
6. Epic F: Admin Policy and Analytics

---

## 20. Build Sequence Recommendation

1. In-shop discovery and booking first
2. Payment and policy hardening
3. Pilot with selected partner shops
4. Delivery mode after KPI stability
5. Expand features by experiment outcomes

---

## 21. Kill Criteria and Pivot Triggers

If these persist beyond agreed period, trigger pivot review:

1. Completion rate below threshold
2. Complaint/refund above threshold
3. Partner retention below threshold
4. Negative unit economics trend without improvement

Pivot options:

1. Pause delivery and focus on in-shop
2. Narrow partner segments
3. Reduce rollout geography and rebuild supply quality

---

## 22. Immediate Next Steps (Next 2 Weeks)

1. Confirm launch mode: In-Shop first
2. Freeze charter, metrics, and non-goals
3. Freeze legal and policy drafts
4. Freeze ERD and API v1
5. Produce hi-fi UX for:
- nearby search
- shop detail
- booking checkout
- partner onboarding
6. Start sprint 1 with modular monolith baseline

---

## 23. Final Recommendation

1. Treat BarberGo as a new marketplace product from day one
2. Win on nearby search quality and booking reliability first
3. Build strong partner onboarding and trust operations early
4. Scale by zone only after KPI gates are met
5. Expand to delivery mode after in-shop operations are stable

This path reduces risk, controls quality, and improves long-term growth probability.

