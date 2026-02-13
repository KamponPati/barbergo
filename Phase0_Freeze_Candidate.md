# BarberGo Phase 0 Freeze Candidate Package

Version: 1.0-rc1  
Prepared Date: 2026-02-12  
Target Freeze Date: 2026-02-16  
Source of truth: `New_Project.md` v3.1, `Phase0_Working_Drafts.md` v0.2-draft

---

## 1) Freeze Scope

This package requests freeze approval for:

1. Project Charter and Non-Goals (Phase 1 boundaries)
2. North Star (WCB) and KPI dictionary v1
3. Policy matrix v1 (cancellation/no-show/refund/partner penalties)
4. Trust and Safety baseline policy v1
5. Legal pack structure baseline (customer terms, partner agreement, privacy policy)

Out of scope for this freeze:

1. Final legal wording approval (scheduled in next review loop)
2. UX hi-fi sign-off (separate track)
3. ERD/API freeze (Phase 1)

---

## 2) Baseline Decisions Locked in RC1

1. Launch mode: In-Shop first; Delivery after KPI stability gate.
2. North Star metric: Weekly Completed Bookings (WCB), timezone UTC+7.
3. Cancellation/no-show/refund baseline thresholds follow policy matrix in working draft v0.2.
4. Partner no-show compensation coupon cap: 20% of booking value, max 200 THB.
5. Late customer cancellation fee in v1: universal rule (not tier-based).
6. Proposed policy effective date: 2026-03-01 (pending legal sign-off).

---

## 3) Deliverables Included

1. `Phase0_Working_Drafts.md` v0.2-draft
2. Charter and Non-Goals freeze candidate (Section 1)
3. KPI dictionary v1 draft (Section 2)
4. Policy matrix and decision log (Section 3)
5. Trust and Safety policy draft (Section 5)
6. Legal pack skeleton and legal review checklist (Section 6)

---

## 4) Readiness Checklist

- [x] Charter and non-goals are documented and aligned to launch strategy
- [x] North Star and KPI definitions are documented
- [x] Policy matrix decisions are recorded with explicit thresholds
- [x] Trust and safety escalation model is defined
- [x] Legal pack structure exists for legal wording pass
- [x] Open decisions converted to decision log
- [ ] Legal final wording approved
- [ ] Cross-functional sign-off completed

---

## 5) Risks and Remaining Gaps

1. Legal language is still draft-level and may require policy phrasing changes.
2. Coupon cap and fee percentages need final finance validation.
3. Some abuse detection thresholds still need Ops calibration on pilot data.
4. Dashboard implementation details are pending data pipeline readiness in Phase 1.

Mitigation plan:

1. Complete legal wording review by 2026-02-14.
2. Lock finance validation in review session by 2026-02-15.
3. Finalize abuse threshold calibration by 2026-02-16.
4. Keep change log for any post-freeze adjustments with owner approval.

---

## 6) Approval Matrix

| Function | Owner | Decision | Date | Notes |
|---|---|---|---|---|
| Product | TBD | Pending | - | - |
| Operations | TBD | Pending | - | - |
| Legal | TBD | Pending | - | - |
| Engineering | TBD | Pending | - | - |

Approval rule:

1. Freeze becomes effective when all 4 functions approve.
2. Any rejection must include specific blocking clauses and re-review date.

---

## 7) Post-Freeze Actions

1. Tag documents as `Phase0-Frozen-v1.0` after full approval.
2. Feed frozen policy/KPI rules into Phase 1 architecture planning.
3. Open Phase 1 kickoff checklist only after freeze completion note is logged.
