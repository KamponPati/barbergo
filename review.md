# Phase Documentation Review

Date: 2026-02-13  
Reviewer: Codex  
Scope: `Phase0_*`, `Phase1_*`, `docs/phase1-*`, `docs/ops/phase3/*`, `docs/ops/phase4/*`, `task.md`

## Summary

เอกสารมีความครบถ้วนในเชิง coverage แต่ยังมี **ความไม่สอดคล้องของสถานะ (status/gate/readiness)** หลายจุดที่กระทบการตัดสินใจ go-live/scale จริง  
สถานะปัจจุบันควรถูกมองว่า: **ยังไม่ production-ready ในเชิงเอกสาร governance**

## Findings and Required Fixes

### 1) Critical - Go/No-Go ระบุ Go แต่ evidence KPI/readiness ยัง fail

Evidence:
- `docs/ops/phase3/runbooks/go-no-go-phase4.md:8` บอกว่า training completed
- `docs/ops/phase3/configs/pilot-partners.csv:4` ยัง `training_status=in_progress`
- `docs/ops/phase3/runbooks/go-no-go-phase4.md:17` แนะนำ Go
- `docs/ops/phase3/reports/2026-02-13-kpi.md:15`
- `docs/ops/phase3/reports/2026-02-13-kpi.md:16`
- `docs/ops/phase3/reports/2026-02-13-kpi.md:17`
- `docs/ops/phase3/reports/2026-02-13-kpi.md:18` หลาย metric เป็น fail
- `docs/ops/phase3/reports/2026-W07-postmortem.md:26`
- `docs/ops/phase3/reports/2026-W07-postmortem.md:27`
- `docs/ops/phase3/reports/2026-W07-postmortem.md:28` corrective actions ยัง Open

Required fix:
- เปลี่ยนผล Go/No-Go เป็น `No-Go` หรือ `Go with explicit exception + owner + due date`
- lock สถานะ training ให้ตรงกับข้อมูล partner จริง
- ปิด corrective actions ก่อนเซ็นผ่าน gate หรือระบุ waiver อย่างเป็นทางการ

### 2) Critical - Phase 4 ใน `task.md` เป็น DONE/Signed แต่ config readiness ยัง pending/blocked

Evidence:
- `task.md:267` ระบุเปิด Delivery mode แล้ว (DONE)
- `task.md:375` ระบุ `Phase 4 Signed`
- `docs/ops/phase4/configs/delivery-readiness.yaml:13` และ `docs/ops/phase4/configs/delivery-readiness.yaml:17` ยัง `delivery_mode: disabled`
- `docs/ops/phase4/configs/delivery-readiness.yaml:15` เป็น `decision: pending`
- `docs/ops/phase4/configs/delivery-readiness.yaml:19` เป็น `decision: blocked`

Required fix:
- เลือก source of truth เดียว (`task.md` หรือ `docs/ops/phase4/configs/*`)
- ถ้า readiness ยังไม่ผ่าน ให้ปรับ `task.md` กลับเป็น `IN_PROGRESS/BLOCKED`
- ถ้าจะคง `DONE/Signed` ต้องอัปเดต config/reports ให้สอดคล้องและมีหลักฐานอนุมัติ

### 3) High - KPI definition ไม่ตรงกันข้าม phase

Evidence:
- `Phase0_Working_Drafts.md:74` complaint = `complaints / completed_bookings`
- `docs/ops/phase3/runbooks/sla-quality-monitoring.md:9` complaint = `complaints / total bookings`
- `Phase0_Working_Drafts.md:76` refund = `refunded_bookings / captured_payments`
- `docs/ops/phase3/runbooks/sla-quality-monitoring.md:10` refund = `refunds / total bookings`

Required fix:
- ตั้ง metric dictionary กลาง 1 แหล่ง (เช่น `docs/metrics/kpi-dictionary-v1.md`)
- refactor ทุก runbook/report/template ให้ยึดนิยามเดียวกัน
- เพิ่ม data contract field ระบุ denominator ชัดเจนใน report generation

### 4) High - Gate criteria ใน Phase 4 ไม่ครบตามเหตุผล hold

Evidence:
- `docs/ops/phase4/configs/coverage-gates.yaml:20` hold reason = `on_time_start_rate_below_threshold`
- แต่ `docs/ops/phase4/configs/coverage-gates.yaml:5` ถึง `docs/ops/phase4/configs/coverage-gates.yaml:9` ไม่มี gate ของ on-time start
- `docs/ops/phase4/reports/2026-02-13-zone-gates.md:3` ไม่มีคอลัมน์ on-time start

Required fix:
- เพิ่ม `min_on_time_start_rate` ใน coverage gate
- อัปเดต script/report ให้ประเมินและแสดง on-time start
- ตรวจให้ hold reason mapping ได้ 1:1 กับ gate definitions

### 5) Medium - เอกสาร Phase 0 บางไฟล์ stale จากสถานะล่าสุด

Evidence:
- `Phase0_Freeze_Candidate.md:83` ถึง `Phase0_Freeze_Candidate.md:86` ยัง `TBD/Pending`
- `Phase0_Freeze_Candidate.md:59` ยังไม่ติ๊ก cross-functional sign-off
- แต่ `Phase0_Signoff_Notes.md:85` ระบุ Approved แล้ว

Required fix:
- อัปเดต `Phase0_Freeze_Candidate.md` ให้สะท้อนผล sign-off ล่าสุด
- ใส่ timestamp และ version bump หลัง close phase
- ระบุ clearly ว่าไฟล์ไหนเป็น archive, ไฟล์ไหนเป็น current record

### 6) Low - เวลาประชุม war-room ไม่ตรงกัน

Evidence:
- `Phase0_Operations_Pack.md:185` daily review 10:00 (UTC+7)
- `docs/ops/phase3/runbooks/daily-kpi-war-room.md:4` daily 09:30 local time

Required fix:
- เลือกเวลาเดียวและแก้ทุกเอกสารให้ตรง
- ถ้าเปลี่ยนเวลา ให้เพิ่ม change log สั้น ๆ ว่าปรับเมื่อไรและโดยใคร

## Proposed Immediate Action Plan

1. Sync status layer:
- ปรับสถานะใน `task.md`, Go/No-Go, และ phase configs ให้ตรงกันในรอบเดียว

2. Normalize KPI semantics:
- ตกลงนิยาม KPI กลางและอัปเดตรายงาน/สคริปต์ที่เกี่ยวข้อง

3. Tighten gate governance:
- ทุก decision ต้องมี `decision`, `owner`, `date`, `evidence link`, `expiry/next review`

4. Prevent recurrence:
- เพิ่ม pre-signoff checklist บังคับ consistency check ข้ามไฟล์ก่อน mark `DONE/Signed`

