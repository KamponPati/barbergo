# BarberGo Phase 0 Working Drafts

Version: 0.2-draft  
Date: 2026-02-12  
Source baseline: `New_Project.md` v3.1

---

## 1) Project Charter + Non-Goals (Freeze Candidate)

### 1.1 Problem Statement

1. Customers spend too much time finding trustworthy barbershops with available slots.
2. Partner shops need more predictable demand and better operational visibility.
3. Market quality is inconsistent without standardized trust and policy controls.

### 1.2 Vision

Make haircut booking as easy as ride-hailing with reliable quality, trust, and operations.

### 1.3 12-Month Objectives

1. Reach sustainable Weekly Completed Bookings (WCB) in pilot city.
2. Improve repeat booking behavior (D30 and D60) month-over-month.
3. Maintain partner supply quality (completion and complaint thresholds).
4. Keep unit economics trend improving with controlled refund/penalty leakage.

### 1.4 Non-Goals (Phase 1 Freeze)

1. Nationwide rollout before pilot KPI gates pass.
2. Full AI personalization and recommendation stack.
3. Enterprise white-label architecture.
4. Full subscription product suite.

### 1.5 Scope Guardrails (Phase 0/1)

1. Launch mode is In-Shop booking first.
2. Delivery mode is blocked until Phase 3 KPI stability review.
3. Policy/legal docs must be approved before live transactions.
4. ERD/API freeze is mandatory before Phase 2 core build.

### 1.6 Sign-off Checklist

- [ ] Product sign-off complete
- [ ] Ops sign-off complete
- [ ] Legal sign-off complete
- [ ] Engineering sign-off complete
- [ ] Version frozen as Charter v1.0

---

## 2) North Star + KPI Dictionary (Draft v1)

### 2.1 North Star Metric

1. **Weekly Completed Bookings (WCB)**  
Definition: Count of bookings with final state `completed` during calendar week (Mon-Sun, UTC+7).  
Formula: `WCB = COUNT(bookings WHERE state='completed' AND completed_at BETWEEN week_start AND week_end)`

### 2.2 Growth Metrics

1. **MAU (Monthly Active Users)**  
Definition: Unique customers with at least 1 session or booking action in calendar month.
2. **New Active Partners**  
Definition: Unique partners with first completed booking in period.
3. **Search-to-Booking Conversion**  
Definition: `bookings_created / unique_search_sessions`.

### 2.3 Quality Metrics

1. **Completion Rate**  
Definition: `completed_bookings / confirmed_bookings`.
2. **Complaint Rate**  
Definition: `complaint_tickets / completed_bookings`.
3. **Refund Rate**  
Definition: `refunded_bookings / captured_payments`.
4. **Repeat Booking D30/D60**  
Definition: % customers with another completed booking in 30/60 days after first completion.

### 2.4 Efficiency Metrics

1. **Time-to-Confirm**  
Definition: median and P95 minutes from booking creation to partner confirm.
2. **On-Time Start Rate**  
Definition: `% jobs started within SLA threshold from scheduled_start_at`.
3. **Slot Utilization**  
Definition: `booked_slots / available_slots`.

### 2.5 Financial Metrics

1. **GMV**: Sum of captured booking gross amount.
2. **Net Revenue**: GMV minus refunds minus promotions minus payment fees.
3. **Contribution Margin Trend**: period-over-period contribution margin percentage.

### 2.6 KPI Ownership (Initial Mapping)

1. Product Analytics: WCB, MAU, conversion, repeat.
2. Ops: completion, on-time start, complaint.
3. Finance: GMV, net revenue, refund, contribution margin.
4. Engineering/Data: metric data quality, event integrity, dashboard freshness.

---

## 3) Policy Matrix (Draft v1)

### 3.1 Cancellation Policy

| Scenario | Threshold | Customer Fee | Partner Impact | Notes |
|---|---|---:|---:|---|
| Customer cancels early | >= 120 min before slot | 0% | 0% | Full release |
| Customer cancels late | 30-119 min before slot | 20% of booking total | 0% | Fee retained as policy |
| Customer very late cancel | < 30 min before slot | 40% of booking total | 0% | Abuse watch trigger |
| Partner cancels after confirm | Any time | 0% to customer | Partner penalty 15% + quality strike | Repeat triggers suspension review |

### 3.2 No-Show Policy

| Scenario | Evidence Required | Financial Outcome | Enforcement |
|---|---|---|---|
| Customer no-show | Partner check-in proof + timestamp | Customer charged 50% | 2 events in 30 days -> warning |
| Partner no-show | Customer evidence + no staff check-in | Full refund + compensation coupon | 1 event -> warning, repeated -> suspension |

### 3.3 Refund Policy

| Case | Refund Type | SLA | Approval Path |
|---|---|---|---|
| Service not delivered | Full refund | <= 24h | Ops auto-approve with evidence |
| Severe quality issue | Partial or full | <= 48h | Ops + policy rule |
| Duplicate charge | Full duplicate amount | <= 24h | Finance/Ops fast track |
| Dispute unresolved in SLA | Provisional partial refund | <= 72h | Admin override |

### 3.4 Partner Penalties

| Trigger | Penalty | Escalation |
|---|---|---|
| Late partner cancel > threshold | 15% fee per incident | 3 incidents/30 days -> temporary suspension |
| Partner no-show | fixed penalty + quality strike | 2 incidents/30 days -> delisting review |
| Fraud/tampering evidence | immediate suspension | legal/compliance review |

### 3.5 Decision Log (Resolved for v0.2)

1. KPI reporting timezone is fixed to UTC+7 for dashboard and policy references.
2. Partner no-show compensation coupon cap is fixed at 20% of booking value (max 200 THB).
3. Late customer cancel fee remains universal in v1 (not service-tiered) for operational simplicity.
4. Legal wording will mirror policy terms exactly for cancellation/no-show/refund/penalty clauses.
5. Policy matrix v1 proposed effective date: 2026-03-01 (pending final legal sign-off).

---

## 4) Next Actions (S0-W1)

1. Run Product/Ops/Legal review session on 2026-02-13 using this v0.2 pre-read.
2. Capture review comments and publish v0.3 update by 2026-02-14.
3. Prepare freeze candidate package by 2026-02-16.

---

## 5) Trust and Safety Policy (Draft v1)

### 5.1 Partner Violation Matrix

| Level | Trigger Example | Action | Recovery Path |
|---|---|---|---|
| L1 Warning | 1 late cancel incident | Written warning + guidance | Auto clear if no repeat in 30 days |
| L2 Suspension | Repeated no-show / operational abuse | Temporary suspension (3-14 days) | Ops review + corrective plan |
| L3 Delisting | Fraud, severe misconduct, repeated high-risk abuse | Permanent delisting | Admin appeal route (case-by-case) |

### 5.2 Customer Abuse Controls

| Abuse Pattern | Detection Signal | Action | Escalation |
|---|---|---|---|
| Repeat no-show | >= 2 no-show in 30 days | Warning + stricter prepay rule | Temporary block for next incident |
| Refund abuse | unusual refund ratio + repeated disputes | Manual review queue | Partial restriction / account hold |
| Harassment/violence | verified report from partner/staff | Immediate temporary block | Permanent block after investigation |

### 5.3 Evidence Standards

1. All punitive actions require evidence references (booking id, event timeline, actor, timestamp).
2. No-show disputes require check-in or geolocation/timestamp proof from at least one side.
3. Admin override must include reason code and approval actor in audit log.

### 5.4 Appeal and Review SLA

1. Warning appeal SLA: <= 72 hours.
2. Suspension appeal SLA: <= 5 business days.
3. Delisting appeal SLA: <= 10 business days.
4. Every final decision must be logged in admin audit trail.

---

## 6) Legal Pack Skeleton (Review Draft)

### 6.1 Customer Terms (Structure)

1. Definitions and service scope
2. Account eligibility and user responsibilities
3. Booking, payment authorization, capture, and refund logic
4. Cancellation/no-show charges and exceptions
5. Reviews, disputes, and evidence process
6. Prohibited conduct and enforcement
7. Liability limitations and force majeure
8. Governing law and dispute forum
9. Policy update notice and effective date

### 6.2 Partner Agreement (Structure)

1. Partner onboarding and KYC obligations
2. Service quality, availability, and operational duties
3. Commission, settlement window, and payout conditions
4. Cancellation/no-show penalties and quality scoring
5. Document and data accuracy obligations
6. Suspension, termination, and delisting clauses
7. Audit rights and record retention requirements
8. Indemnity, liability, and insurance expectations
9. Change management and notice period

### 6.3 Privacy Policy (Structure)

1. Data categories collected (identity, booking, payment, location)
2. Purpose of processing and lawful basis
3. Data sharing with partners/processors
4. Retention and deletion policy
5. Data subject rights and request flow
6. Security controls and breach notification approach
7. Cross-border transfer statement (if applicable)
8. Contact channel for privacy requests
9. Versioning and update history

### 6.4 Legal Review Checklist

- [ ] Terms language aligns with cancellation/refund policy matrix
- [ ] Partner penalties language aligns with trust and safety matrix
- [ ] Privacy data map aligns with actual event/data model
- [ ] Consent logging and retention clauses are testable in implementation

---

## 7) Change Log

### v0.2-draft (2026-02-12)

1. Added Trust and Safety Policy draft section.
2. Added Legal Pack Skeleton draft section.
3. Resolved policy open decisions into a formal decision log.
4. Added proposed policy effective date for freeze package prep.
