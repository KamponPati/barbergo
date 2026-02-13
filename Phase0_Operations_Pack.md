# BarberGo Phase 0 Operations Pack

Version: 1.0-draft  
Date: 2026-02-12  
Purpose: Complete remaining Phase 0 artifacts for freeze and sign-off.

References:

1. `Phase0_Working_Drafts.md` v0.2-draft
2. `Phase0_Freeze_Candidate.md` v1.0-rc1
3. `Phase0_Signoff_Notes.md` v1.1-prefilled-draft

---

## 1) UX Flow Confirmation (Core Journeys)

### 1.1 Nearby Search Flow

1. App launch -> location permission prompt
2. Nearby shop list/map shown within service radius
3. Filter and sort by distance/rating/price/open-now
4. Select shop card -> open shop detail

Exit criteria:

1. User can find at least 1 available shop in <= 3 taps after location grant.
2. Result set exposes distance, rating, starting price, and next available slot.

### 1.2 Shop Detail Flow

1. View shop profile, branch list, service catalog, staff list, reviews
2. Select branch and service
3. Open availability panel for slot selection

Exit criteria:

1. Service price and duration are visible before slot selection.
2. Branch hours and slot availability are consistent with backend capacity rules.

### 1.3 Booking Checkout Flow

1. Select slot -> quote preview
2. Confirm contact details and payment method
3. Authorize payment
4. Booking moves to `paid_authorized` then partner confirmation path

Exit criteria:

1. Idempotency key required on booking/payment write endpoint.
2. Customer receives booking confirmation timeline event.

### 1.4 Partner Onboarding Flow

1. Partner registration and KYC submission
2. Branch/service/staff setup
3. Bank account configuration
4. Admin verification result (approve/reject/revise)

Exit criteria:

1. Partner cannot go live before KYC approved.
2. Required profile completeness reaches 100% before activation.

---

## 2) Pilot City/Zone and Partner Selection

### 2.1 Pilot Zone Selection Criteria

1. Demand density: minimum search volume threshold per week
2. Supply readiness: sufficient active partner count in radius
3. Serviceability: average customer-to-branch distance within target
4. Safety and support coverage: operational team can handle incidents in SLA

### 2.2 Recommended Pilot Setup (Initial)

1. Start with 2 zones: Zone A (high demand) + Zone B (balanced control)
2. Limit launch partners to quality-screened onboarding batch
3. Keep delivery mode disabled in pilot

### 2.3 Partner Selection Rubric

| Criterion | Weight | Threshold |
|---|---:|---|
| KYC/document completeness | 25% | 100% required |
| Historical service quality proxy | 25% | >= baseline quality score |
| Operational readiness (hours/capacity/staff) | 30% | Pass checklist |
| Pricing competitiveness | 10% | within target range |
| Response discipline | 10% | agrees to response SLA |

---

## 3) SLA and Support Playbook (Initial)

### 3.1 SLA Targets (Pilot)

| Metric | Target | Alert Threshold | Owner |
|---|---|---|---|
| Booking confirm time | <= 10 min (P95) | > 15 min | Ops |
| On-time service start | >= 90% | < 85% | Ops + Partner |
| Completion rate | >= 92% | < 88% | Ops |
| First response time (support) | <= 5 min | > 10 min | Support |
| Dispute first triage | <= 30 min | > 60 min | Support/Ops |

### 3.2 Incident Classes

1. P0: payment failure, major booking outage, safety incident
2. P1: localized booking disruption, reconciliation mismatch spikes
3. P2: non-critical UX issues, delayed notifications

### 3.3 Support Playbook by Scenario

1. No-show dispute: gather evidence, apply policy matrix, decide within SLA
2. Late cancel complaint: check threshold/time, apply fee logic, notify both sides
3. Payment anomaly: freeze settlement item, reconcile, resolve/refund path
4. Safety complaint: immediate protective action + escalation to trust/safety owner

---

## 4) Event Taxonomy (Analytics and Audit v1)

### 4.1 Naming Convention

1. Format: `<domain>.<entity>.<action>`
2. Example: `booking.request.created`, `payment.authorize.succeeded`

### 4.2 Core Event List

1. `discovery.search.executed`
2. `shop.detail.viewed`
3. `availability.slot.selected`
4. `booking.quote.created`
5. `booking.request.created`
6. `booking.request.confirmed`
7. `booking.service.started`
8. `booking.service.completed`
9. `booking.request.cancelled`
10. `payment.authorize.succeeded`
11. `payment.capture.succeeded`
12. `payment.refund.initiated`
13. `dispute.ticket.opened`
14. `dispute.ticket.resolved`
15. `partner.kyc.submitted`
16. `partner.kyc.approved`
17. `policy.override.applied`

### 4.3 Required Event Fields

1. `event_id`
2. `event_name`
3. `occurred_at`
4. `request_id`
5. `actor_user_id` (nullable for system events)
6. `entity_id` (booking/payment/dispute/partner)
7. `entity_type`
8. `source_channel` (customer_app/partner_app/admin_web/system)
9. `metadata_json`

### 4.4 Audit-Critical Events

1. Policy override
2. Refund decision
3. Penalty/suspension action
4. Role/permission changes
5. KYC approval/rejection

---

## 5) KPI Owner Mapping and Cadence (Freeze v1)

| KPI | Primary Owner | Secondary Owner | Reporting Cadence | Source |
|---|---|---|---|---|
| WCB | Product | Data/Engineering | Daily + Weekly | bookings/events |
| MAU | Product | Data/Engineering | Weekly | app events |
| Search-to-Booking Conversion | Product | Ops | Daily | discovery/booking events |
| Completion Rate | Ops | Product | Daily | booking states |
| Complaint Rate | Ops | Support | Daily | disputes/support tickets |
| Refund Rate | Finance | Ops | Daily + Weekly | payment/refund ledger |
| Time-to-Confirm | Ops | Engineering | Daily | booking events |
| On-Time Start Rate | Ops | Partner Ops | Daily | service start events |
| GMV/Net Revenue | Finance | Product | Daily + Weekly | payment + ledger |

Cadence policy:

1. Daily review at war-room cutoff 10:00 local time (UTC+7).
2. Weekly exec summary every Monday.
3. Any metric definition change requires version bump and change log note.

---

## 6) Legal Wording Alignment Matrix (Policy to Clause)

| Policy Item | Clause Target | Status | Owner |
|---|---|---|---|
| Late customer cancel fee | Customer Terms - Cancellation section | Aligned v1 draft | Legal |
| Customer no-show charge | Customer Terms - No-show section | Aligned v1 draft | Legal |
| Partner late cancel penalty | Partner Agreement - Penalty section | Aligned v1 draft | Legal |
| Partner no-show enforcement | Partner Agreement - Service obligations | Aligned v1 draft | Legal |
| Refund SLA and decision rights | Customer Terms + Internal Ops SOP | Aligned v1 draft | Legal/Ops |

Alignment note:

1. Legal text must preserve thresholds exactly as policy matrix v1 unless explicit versioned exception is approved.

---

## 7) Closeout Note

This pack is intended to close Phase 0 remaining documentation gaps and enable final sign-off circulation.
