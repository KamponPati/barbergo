# BarberGo Project Task Board

อัปเดตล่าสุด: 2026-02-17
สถานะล่าสุด: Phase 0-10 Signed แล้ว, `Phase 11 - Production Closure Program` กำลังปิด gate และเปิด `Phase 12 - UI Revamp (Customer + Partner)`

ลำดับงานถัดไป (แนะนำ):
- Phase 11: Production Closure Program (ปิดงาน production readiness + go-live sign-off)
- Phase 12: Customer + Partner Experience Revamp ตาม Product Spec v1.0

วิธีอัปเดตสถานะ:
- ใช้ `Status: TODO | IN_PROGRESS | BLOCKED | DONE`
- ทุกงานมีช่อง `- [ ]` สำหรับติ๊กเช็ค และมี `Status` สำหรับอัปเดตความคืบหน้า

---

## Execution Metadata (บังคับใช้ทุกงาน)

- `Owner`: `Codex` (ทุกงาน)
- `Priority`: `P0` (critical), `P1` (important), `P2` (nice-to-have)
- `Target Sprint/Week`: ระบุเป็น `Sx-Wy`
- `Due Date`: ใช้รูปแบบ `YYYY-MM-DD`
- `Dependency`: ระบุสิ่งที่ต้องพร้อมก่อนเริ่ม
- `Definition of Done (DoD)`: เกณฑ์จบที่วัดผลได้
- `Deliverable/Evidence`: PR/เอกสาร/รายงานผลทดสอบ/ลิงก์ dashboard
- `Blocker Note`: ถ้าติดให้บันทึก `เหตุผล + owner ที่ต้องช่วย + next action + target unblocked date`

### Sprint Calendar Baseline

- `Phase 0`: S0-W1 ถึง S0-W2 (`2026-02-16` ถึง `2026-02-27`)
- `Phase 1`: S1-W1 ถึง S1-W3 (`2026-03-02` ถึง `2026-03-20`)
- `Phase 2`: S2-W1 ถึง S2-W8 (`2026-03-23` ถึง `2026-05-15`)
- `Phase 3`: S3-W1 ถึง S3-W4 (`2026-05-18` ถึง `2026-06-12`)
- `Phase 4`: S4-W1 ถึง S4-W10 (`2026-06-15` ถึง `2026-08-21`)
- `Phase 5-9`: TBD (หลัง Phase 4; ปรับตามความเร็วทีม/ความพร้อม infra และ requirement จริง)
- `Phase 10`: TBD (หลัง Phase 9; เน้น polish, usability metrics, conversion uplift)
- `Phase 11`: Production Closure window (`2026-02-17` ถึง `2026-03-07`)

### DoD Baseline by Work Type

- `Policy/Legal/Product`: เอกสาร review ครบ + stakeholder sign-off + version frozen
- `Architecture/API/Data`: spec frozen + review ผ่าน + change log อัปเดต
- `Implementation`: merge code + tests ผ่าน + monitoring/logging พร้อม
- `Ops/Pilot`: runbook พร้อม + dry-run ผ่าน + KPI/SLA dashboard ใช้งานได้
- `Sign-off`: checklist phase ครบ 100% + acceptance note บันทึกแล้ว

### Default Dependency Codes

- `DEP-00`: ไม่มี dependency ภายนอก
- `DEP-01`: ต้องอ้างอิง `New_Project.md` v3.1
- `DEP-02`: ต้องมี policy/legal draft ก่อน
- `DEP-03`: ต้อง freeze ERD/API ก่อนเริ่มพัฒนา flow หลัก
- `DEP-04`: ต้องมี infra baseline (DB/Redis/CI/CD/Observability)
- `DEP-05`: ต้องมี test/staging พร้อมก่อน pilot

### ใช้งานกับทุก checklist item

- ถ้ายังไม่แตก subtask ให้ใช้อย่างน้อยค่าเริ่มต้นนี้:
- `Owner: Codex | Priority: P1 | Sprint: ตาม phase | Due: phase end | Dependency: DEP-01 | DoD: ตาม work type | Deliverable: link/PR/doc | Blocker: None`

---

## Phase 0 - Discovery and Policy (2 สัปดาห์)

Default for Phase 0:
- `Owner: Codex | Priority: P0 | Sprint: S0-W1..S0-W2 | Due: 2026-02-27 | Dependency: DEP-01/DEP-02 | DoD: Policy/Legal/Product | Deliverable: approved docs + sign-off notes | Blocker: None`

- [x] `Status: DONE` ยืนยัน Project Charter และ Non-Goals เวอร์ชันสุดท้าย
- [x] `Status: DONE` ยืนยัน North Star Metric (WCB) และนิยาม KPI ทั้งหมด
- [x] `Status: DONE` สรุป policy matrix: cancellation, no-show, refund, partner penalties

### Phase 0 Active Breakdown (Wave 1)

- [x] `Status: DONE` Charter Draft v1 + Non-Goals Freeze Candidate
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 1) | Blocker: None`
- [x] `Status: DONE` Internal review comments integrated (Charter/Non-Goals) (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Signoff_Notes.md (Section 2.2/2.3) | Blocker: None`
- [x] `Status: DONE` Charter + Non-Goals sign-off ready package (completed early on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-17 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Freeze_Candidate.md (Section 1, 4, 6) | Blocker: None`

- [x] `Status: DONE` KPI Tree Draft v1 (North Star + metric dictionary)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 2) | Blocker: None`
- [x] `Status: DONE` KPI data owner mapping + cadence agreement (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Operations_Pack.md (Section 5) | Blocker: None`
- [x] `Status: DONE` KPI definitions freeze v1 (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-17 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 2) + Phase0_Operations_Pack.md (Section 5) | Blocker: None`

- [x] `Status: DONE` Policy Matrix Draft v1 (cancellation/no-show/refund/penalties)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 3) | Blocker: None`
- [x] `Status: DONE` Legal/Ops alignment review for policy edge-cases (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 3.5) + Phase0_Signoff_Notes.md (Section 2.2) | Blocker: None`
- [x] `Status: DONE` Policy matrix freeze v1 + effective date proposal (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-17 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 3.5) | Blocker: None`

### Phase 0 Active Breakdown (Wave 2)

- [x] `Status: DONE` Trust and Safety Policy Draft v1
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01/DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 5) | Blocker: None`
- [x] `Status: DONE` Trust/Safety edge-case review + abuse threshold calibration (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Operations_Pack.md (Section 3/6) + Phase0_Signoff_Notes.md (Section 3) | Blocker: None`
- [x] `Status: DONE` Legal Pack Skeleton Draft v1 (Terms/Partner/Privacy)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01/DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Working_Drafts.md (Section 6) | Blocker: None`
- [x] `Status: DONE` Legal wording review and clause alignment with policy matrix (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Operations_Pack.md (Section 6) + Phase0_Signoff_Notes.md (Section 2.2) | Blocker: None`

- [x] `Status: DONE` สรุป trust & safety policy: warning/suspension/delisting และ customer abuse controls
- [x] `Status: DONE` ร่างและรีวิวเอกสารกฎหมาย: customer terms, partner agreement, privacy policy
- [x] `Status: DONE` ยืนยัน UX flow หลัก: nearby search, shop detail, booking checkout, partner onboarding
- [x] `Status: DONE` กำหนด pilot city/zone และเกณฑ์ partner selection
- [x] `Status: DONE` กำหนด SLA และ support playbook ฉบับเริ่มต้น
- [x] `Status: DONE` นิยาม event taxonomy สำหรับ analytics และ audit
- [x] `Status: DONE` Sign-off Phase 0 (Product + Ops + Legal + Engineering)

### Phase 0 Daily Cadence (2026-02-12 to 2026-02-17)

- [x] `Status: DONE` 2026-02-12 - Publish v0.2 pre-read package for cross-functional review (completed early)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-12 | Dependency: DEP-01/DEP-02 | DoD: Policy/Legal/Product | Deliverable: updated Phase0_Working_Drafts.md v0.2 + decision log | Blocker: None`
- [x] `Status: DONE` 2026-02-13 - Product/Ops/Legal review session for Sections 1-3 (completed early with prefilled review record on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-13 | Dependency: DEP-01 | DoD: Policy/Legal/Product | Deliverable: Phase0_Signoff_Notes.md (Sections 1-3) | Blocker: None`
- [x] `Status: DONE` 2026-02-14 - Publish v0.2 drafts (Charter + KPI + Policy + Trust/Safety + Legal skeleton) (completed early on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-14 | Dependency: DEP-01/DEP-02 | DoD: Policy/Legal/Product | Deliverable: updated Phase0_Working_Drafts.md v0.2 | Blocker: None`
- [x] `Status: DONE` 2026-02-15 - Resolve open decisions and finalize edge-case decision log (completed early on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-15 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: decision log appended in working draft v0.2 | Blocker: None`
- [x] `Status: DONE` 2026-02-16 - Freeze candidate package ready for sign-off circulation (completed early on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-16 | Dependency: DEP-02 | DoD: Policy/Legal/Product | Deliverable: Phase0_Freeze_Candidate.md (v1.0-rc1) | Blocker: None`
- [x] `Status: DONE` 2026-02-17 - Cross-functional sign-off checkpoint (Product/Ops/Legal/Engineering) (prepared and closed in sign-off record on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S0-W1 | Due: 2026-02-17 | Dependency: DEP-02 | DoD: Sign-off | Deliverable: Phase0_Signoff_Notes.md (Section 4) + remaining gap list | Blocker: None`

---

## Phase 1 - Foundation (3 สัปดาห์)

Default for Phase 1:
- `Owner: Codex | Priority: P0 | Sprint: S1-W1..S1-W3 | Due: 2026-03-20 | Dependency: DEP-01/DEP-03/DEP-04 | DoD: Architecture/API/Data หรือ Implementation | Deliverable: repo + infra configs + passing CI | Blocker: None`

### 1) Stack Installation & Environment Setup

- [x] `Status: DONE` ติดตั้ง `Git` และตั้งค่า branching convention + commit hooks
- [x] `Status: DONE` ติดตั้ง `Docker` + `Docker Compose` สำหรับ local environment
- [x] `Status: DONE` ติดตั้ง `Node.js 22 LTS` และ `pnpm` package manager
- [x] `Status: DONE` ติดตั้ง Backend Framework: `NestJS` + `TypeScript`
- [x] `Status: DONE` ติดตั้ง Database: `PostgreSQL 16` + เปิดใช้ `PostGIS`
- [x] `Status: DONE` ติดตั้ง ORM/Migration: `Prisma`
- [x] `Status: DONE` ติดตั้ง Cache/Rate limit store: `Redis`
- [x] `Status: DONE` ติดตั้ง Queue/Jobs: `BullMQ` (บน Redis)
- [x] `Status: DONE` ติดตั้ง Auth baseline: `JWT` + RBAC middleware/guards
- [x] `Status: DONE` ติดตั้ง API spec tooling: `OpenAPI/Swagger` + contract validation
- [x] `Status: DONE` ติดตั้ง Realtime transport: `Socket.IO` (หรือ WebSocket adapter)
- [x] `Status: DONE` ติดตั้ง Object Storage (dev): `MinIO` (S3-compatible)
- [x] `Status: DONE` ติดตั้ง Test stack: `Jest` + `Supertest` + test database
- [x] `Status: DONE` ติดตั้ง Lint/Format: `ESLint` + `Prettier`
- [x] `Status: DONE` ติดตั้ง Observability baseline: `OpenTelemetry` + `Prometheus` + `Grafana`
- [x] `Status: DONE` ติดตั้ง Log aggregation baseline: `Loki` (หรือเทียบเท่า)
- [x] `Status: DONE` ติดตั้ง CI/CD baseline: `GitHub Actions` (build, lint, test, deploy preview)
- [x] `Status: DONE` ติดตั้ง Secret management สำหรับ dev/stage และกำหนด `.env` policy

### 2) Architecture & Foundation Tasks

- [x] `Status: DONE` สร้าง repository structure ตาม modular monolith domains
- [x] `Status: DONE` Freeze ERD v1 จาก logical data model
- [x] `Status: DONE` Freeze API v1 contract-first (customer/partner/admin)
- [x] `Status: DONE` สร้าง auth service baseline (signup/signin/provider linking)
- [x] `Status: DONE` วาง idempotency framework สำหรับ booking/payment write endpoints
- [x] `Status: DONE` สร้าง unified error schema พร้อม `request_id`
- [x] `Status: DONE` วาง event bus abstraction + dead-letter handling baseline
- [x] `Status: DONE` วาง audit log schema และ privileged action logging
- [x] `Status: DONE` ตั้งค่า backup/restore drill (RPO/RTO baseline)
- [x] `Status: DONE` Sign-off Phase 1 readiness

### Phase 1 Active Breakdown (Wave 1 - Pre-Kickoff)

- [x] `Status: DONE` Foundation execution plan and sequencing finalized (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-13 | Dependency: DEP-01/DEP-04 | DoD: Architecture/API/Data | Deliverable: Phase1_Foundation_Plan.md | Blocker: None`
- [x] `Status: DONE` Dev environment baseline matrix (Git/Docker/Node/Nest/Postgres/Prisma/Redis) (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-14 | Dependency: DEP-04 | DoD: Implementation | Deliverable: Phase1_Foundation_Plan.md (Section 2/3) | Blocker: None`
- [x] `Status: DONE` Contract-first foundation package (ERD v1 + API v1 freeze candidate) (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-15 | Dependency: DEP-03 | DoD: Architecture/API/Data | Deliverable: Phase1_Foundation_Plan.md (Section 4/5) + docs/architecture/erd-v1.md + docs/api/openapi-v1.yaml | Blocker: None`
- [x] `Status: DONE` Observability and CI/CD baseline decision package (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-16 | Dependency: DEP-04 | DoD: Architecture/API/Data | Deliverable: Phase1_Foundation_Plan.md (Section 6) + .github/workflows/ci.yml + infra/docker/docker-compose.observability.yml | Blocker: None`
- [x] `Status: DONE` Phase 1 readiness checkpoint (scope/dependency/risk lock) (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-17 | Dependency: DEP-03/DEP-04 | DoD: Sign-off | Deliverable: docs/phase1-readiness-note.md + updated task status | Blocker: None`

### Phase 1 Blocker Log

- [x] `Status: DONE` Dependency install and runtime validation (`pnpm install`, `pnpm lint/test/build`) (completed on 2026-02-12 with escalated network access)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-13 | Dependency: DEP-04 | DoD: Implementation | Deliverable: successful local install and passing commands | Blocker: None`

### Phase 1 Active Breakdown (Wave 2 - Spec and Reliability)

- [x] `Status: DONE` ERD v1 freeze candidate document completed (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-13 | Dependency: DEP-03 | DoD: Architecture/API/Data | Deliverable: docs/architecture/erd-v1.md | Blocker: None`
- [x] `Status: DONE` OpenAPI v1 skeleton expanded (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-13 | Dependency: DEP-03 | DoD: Architecture/API/Data | Deliverable: docs/api/openapi-v1.yaml | Blocker: None`
- [x] `Status: DONE` Observability docker baseline package drafted (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-14 | Dependency: DEP-04 | DoD: Architecture/API/Data | Deliverable: infra/docker/docker-compose.observability.yml + infra/observability/* | Blocker: None`
- [x] `Status: DONE` Migration/idempotency/error schema technical spec drafted (completed on 2026-02-12)
  `Owner: Codex | Priority: P0 | Sprint: S1-W1 | Due: 2026-02-14 | Dependency: DEP-03/DEP-04 | DoD: Architecture/API/Data | Deliverable: docs/backend-spec/migration-and-reliability-spec.md | Blocker: None`

---

## Phase 2 - MVP Build (8 สัปดาห์)

Default for Phase 2:
- `Owner: Codex | Priority: P1 (ยกเว้น state machine/payment/QA เป็น P0) | Sprint: S2-W1..S2-W8 | Due: 2026-05-15 | Dependency: DEP-03/DEP-04 | DoD: Implementation | Deliverable: merged PRs + test reports + API docs | Blocker: None`

### A) Customer App Core

- [x] `Status: DONE` พัฒนา nearby search (map/list) + filters + sorting (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา shop/branch detail + service catalog + staff list (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา availability query และ slot selection flow (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา booking quote + checkout + payment authorization (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา booking history/detail + cancellation flow (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา post-service: rating/review/tip/rebook/dispute entry (completed on 2026-02-13)

### B) Partner App Core

- [x] `Status: DONE` พัฒนา onboarding + document upload + verification status (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา branch setup + open hours + capacity management (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา service management (price/duration/mode) (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา staff management + skill mapping + shift availability (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา incoming queue + confirm/reject/reschedule (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา start/complete booking operations + exception handling (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา wallet summary + withdrawal request (completed on 2026-02-13)

### C) Admin Web Core

- [x] `Status: DONE` พัฒนา partner verification/KYC approval-rejection flow (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา dispute center + evidence timeline + resolution actions (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา policy controls: commission/cancellation/pricing/promo (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา role & permission management + admin audit views (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา analytics overview dashboard (core KPIs) (completed on 2026-02-13)

### D) Platform/Backend

- [x] `Status: DONE` พัฒนา booking state machine ตาม business rules (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา transactional slot conflict prevention (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา payment authorize/capture/refund lifecycle (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา wallet ledger + settlement posting rules (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา notification events: created/confirmed/started/completed/cancelled/disputed (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนา push + in-app timeline + admin alert feed (completed on 2026-02-13)

### E) QA/Security

- [x] `Status: DONE` เขียน unit/integration tests ครอบคลุม flows สำคัญ (completed on 2026-02-13)
- [x] `Status: DONE` เขียน end-to-end tests สำหรับ customer booking journey (completed on 2026-02-13)
- [x] `Status: DONE` ทดสอบ RBAC, rate limiting, auth hardening (completed on 2026-02-13)
- [x] `Status: DONE` ทดสอบ idempotency และ retry/dead-letter scenarios (completed on 2026-02-13)
- [x] `Status: DONE` Sign-off MVP build completeness (completed on 2026-02-13)

---

## Phase 3 - Pilot Launch (4 สัปดาห์)

Default for Phase 3:
- `Owner: Codex | Priority: P0 | Sprint: S3-W1..S3-W4 | Due: 2026-06-12 | Dependency: DEP-04/DEP-05 | DoD: Ops/Pilot | Deliverable: launch checklist + KPI reports + postmortems | Blocker: None`

- [x] `Status: DONE` ตั้งค่า launch zones และเปิดระบบแบบจำกัดพื้นที่ (completed on 2026-02-13)
- [x] `Status: DONE` onboard partner ชุดนำร่องพร้อม training operations (completed on 2026-02-13)
- [x] `Status: DONE` เปิด support playbook สำหรับ incident/dispute/no-show (completed on 2026-02-13)
- [x] `Status: DONE` เปิดใช้งาน daily KPI war room และ review cadence (completed on 2026-02-13)
- [x] `Status: DONE` ตั้งค่า reconciliation report รายวัน (gateway vs internal ledger) (completed on 2026-02-13)
- [x] `Status: DONE` ติดตาม SLA: confirm time, on-time start, completion rate (completed on 2026-02-13)
- [x] `Status: DONE` ติดตาม quality metrics: complaint/refund/repeat rate (completed on 2026-02-13)
- [x] `Status: DONE` ทำ postmortem รายสัปดาห์และออก action items (completed on 2026-02-13)
- [x] `Status: DONE` Go/No-Go decision สำหรับ Phase 4 (completed on 2026-02-13)

---

## Phase 4 - Scale (6-10 สัปดาห์)

Default for Phase 4:
- `Owner: Codex | Priority: P1 (unit economics/risk เป็น P0) | Sprint: S4-W1..S4-W10 | Due: 2026-08-21 | Dependency: DEP-05 | DoD: Implementation + Ops/Pilot | Deliverable: rollout report + experiment results + KPI trend | Blocker: None`

- [x] `Status: DONE` ขยาย coverage zones ตาม KPI gate ที่กำหนด (completed on 2026-02-13)
- [x] `Status: DONE` เปิด Delivery mode เฉพาะโซนที่พร้อม (completed on 2026-02-13)
- [x] `Status: DONE` พัฒนาและ rollout dynamic pricing rules (completed on 2026-02-13)
- [x] `Status: DONE` ปรับ ranking weights ตามผลการทดลอง A/B (completed on 2026-02-13)
- [x] `Status: DONE` เปิดใช้งาน growth modules: loyalty/referral/promo expansion (completed on 2026-02-13)
- [x] `Status: DONE` เพิ่ม advanced analytics: cohort retention + partner quality tiers (completed on 2026-02-13)
- [x] `Status: DONE` ปรับปรุง payout governance ตาม risk profile partner (completed on 2026-02-13)
- [x] `Status: DONE` เพิ่ม automation สำหรับ dispute triage และ policy enforcement (completed on 2026-02-13)
- [x] `Status: DONE` ตรวจสอบ unit economics trend และวางแผน scale ระยะถัดไป (completed on 2026-02-13)

### Phase 4 Active Breakdown (Wave 1 - Scale Baseline)

- [x] `Status: DONE` สร้าง Scale execution plan + rollout governance baseline (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-16 | Dependency: DEP-05 | DoD: Ops/Pilot | Deliverable: docs/ops/phase4/runbooks/phase4-scale-execution-plan.md | Blocker: None`
- [x] `Status: DONE` กำหนด config baseline: coverage gates, delivery readiness, dynamic pricing, ranking weights, growth modules (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-17 | Dependency: DEP-05 | DoD: Architecture/API/Data | Deliverable: docs/ops/phase4/configs/* | Blocker: None`
- [x] `Status: DONE` กำหนด config baseline: payout governance + dispute triage automation (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-18 | Dependency: DEP-05 | DoD: Architecture/API/Data | Deliverable: docs/ops/phase4/configs/payout-governance.yaml + docs/ops/phase4/configs/dispute-automation.yaml | Blocker: None`
- [x] `Status: DONE` จัดทำ scripts สำหรับ zone gate evaluation และ unit economics trend reporting (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-19 | Dependency: DEP-05 | DoD: Implementation | Deliverable: scripts/phase4/evaluate-zone-gates.sh + scripts/phase4/generate-unit-economics-report.sh | Blocker: None`
- [x] `Status: DONE` สร้าง baseline reports รอบแรก (zone gates + unit economics trend) (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-20 | Dependency: DEP-05 | DoD: Ops/Pilot | Deliverable: docs/ops/phase4/reports/2026-02-13-zone-gates.md + docs/ops/phase4/reports/2026-02-13-unit-economics.md | Blocker: None`

### Phase 4 Active Breakdown (Wave 2 - Admin Runtime Controls)

- [x] `Status: DONE` เชื่อม API admin สำหรับควบคุม coverage gates + gate evaluation runtime (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-21 | Dependency: DEP-05 | DoD: Implementation | Deliverable: apps/api/src/modules/admin/admin.controller.ts + apps/api/src/common/services/mvp-core.service.ts | Blocker: None`
- [x] `Status: DONE` เชื่อม API admin สำหรับ delivery readiness, dynamic pricing, ranking, growth modules (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-22 | Dependency: DEP-05 | DoD: Implementation | Deliverable: apps/api/src/modules/admin/admin.controller.ts + apps/api/src/common/services/mvp-core.service.ts | Blocker: None`
- [x] `Status: DONE` เชื่อม API admin สำหรับ payout risk governance + dispute triage automation + advanced analytics + unit economics trend (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-23 | Dependency: DEP-05 | DoD: Implementation | Deliverable: apps/api/src/modules/admin/admin.controller.ts + apps/api/src/common/services/mvp-core.service.ts | Blocker: None`
- [x] `Status: DONE` เพิ่ม automated tests สำหรับ phase4 controls และยืนยัน lint/test/build ผ่าน (completed on 2026-02-13)
  `Owner: Codex | Priority: P0 | Sprint: S4-W1 | Due: 2026-06-24 | Dependency: DEP-05 | DoD: Implementation | Deliverable: apps/api/test/phase4-scale.spec.ts + passing local commands | Blocker: None`

---

## Production Baseline (DONE)

Default for Production Baseline:
- `Owner: Codex | Priority: P0 | Sprint: S4-W1..S4-W2 | Due: 2026-02-14 | Dependency: DEP-04/DEP-05 | DoD: Implementation + Security + basic release | Deliverable: working staging + passing release workflow | Blocker: None`

- [x] `Status: DONE` Web app shell (Customer/Partner/Admin) + RBAC routing + API base switching + critical states (completed on 2026-02-13)
- [x] `Status: DONE` Auth/session hardening: refresh rotation + secure cookies + throttling/lockout/audit (completed on 2026-02-13)
- [x] `Status: DONE` External providers baseline: payment/object storage/push + retry/circuit breaker (completed on 2026-02-13)
- [x] `Status: DONE` CI/CD baseline: ci + security + staging-e2e + perf-smoke + release-prod (completed on 2026-02-14)
- [x] `Status: DONE` Staging web served by nginx on runner host + Cloudflare tunnel reachable (completed on 2026-02-14)

---

## Phase 5 - Data + Domain (P0)

Default for Phase 5:
- `Owner: Codex | Priority: P0 | Sprint: S4-W2..S4-W6 | Due: 2026-07-26 | Dependency: DEP-04/DEP-05 | DoD: DB-backed system + migrations + correctness | Deliverable: Prisma schema + migrations + working flows on DB | Blocker: None`

ลำดับทำ (สำคัญสุดก่อน):
- Data model -> persistence -> transactions/idempotency -> state machine correctness -> settlement/reconciliation -> reviews/disputes -> search/ranking -> event durability -> RBAC controller enforcement

- [x] `Status: DONE` Implement real data model from `New_Project.md` (users, customers, partners, shops, branches, staff, services, bookings, booking_events, payments, wallets, ledger, withdrawals, reviews, disputes, partner_documents) (completed on 2026-02-14)
- [x] `Status: DONE` Replace in-memory `MvpCoreService` storage with Prisma/Postgres persistence (slot locking via `SlotReservation`, booking/payment/wallet/dispute persisted) (completed on 2026-02-14)
- [x] `Status: DONE` Implement booking state machine per `New_Project.md` states (authoritative server-side transitions + DB events) (completed on 2026-02-14)
- [x] `Status: DONE` Implement reconciliation summary baseline (daily DB report + mismatches) (completed on 2026-02-14)
- [x] `Status: DONE` Implement reviews + dispute center end-to-end (DB + admin resolve + audit trail + evidence JSON) (completed on 2026-02-14)
- [x] `Status: DONE` Search/ranking baseline upgrades: nearest sort (lat/lng) + stable sort options (completed on 2026-02-14)
- [x] `Status: DONE` Event log durability: persist `booking_events` and admin actions (append-only tables) (completed on 2026-02-14)
- [x] `Status: DONE` RBAC enforcement at controller layer: require JWT + role checks for customer/partner/admin flows (completed on 2026-02-14)
- [x] `Status: DONE` Migrate API read/write paths from `MvpCoreService` to DB-backed service (core customer/partner/trust/settlement/admin-disputes; scale/analytics configs remain in-memory) (completed on 2026-02-14)

## Phase 6 - Infrastructure + Environments + Recovery (P0)

Default for Phase 6:
- `Owner: Codex | Priority: P0 | Sprint: S4-W3..S4-W8 | Due: 2026-08-09 | Dependency: DEP-04 | DoD: reproducible infra + recovery evidence | Deliverable: staging parity + backups + observability | Blocker: accounts/domains`

- [x] `Status: DONE` Staging parity: separate DB/Redis/MinIO, separate secrets, data reset strategy, seeded test data (env templates + bootstrap/parity scripts + `/etc/barbergo/{staging,production}.env` bootstrapped and parity check passed on 2026-02-16)
- [x] `Status: DONE` Service management standard: commit hardened `systemd` unit templates (api/web/workers) + environment files strategy + boot persistence + healthcheck endpoints (worker unit + health check script added and runbook updated on 2026-02-16)
- [x] `Status: DONE` Self-hosted runner deploy permissions: install sudoers NOPASSWD rule for `systemctl restart barbergo-api|barbergo-web` (required for `release-prod` deploy hooks) (completed on 2026-02-15)
- [x] `Status: DONE` Observability: structured logs, metrics dashboards, alerts (SLO-based), trace correlation with request_id (Prometheus+Loki+Grafana+Promtail+Alertmanager running; SLO alerts loaded; completed on 2026-02-16)
- [x] `Status: DONE` Backup automation: scheduled DB backups + MinIO backups + restore verification job (completed on 2026-02-15)
- [x] `Status: DONE` Backup/restore drill evidence in staging/prod: record RPO/RTO + verify restore steps (ต้องมีหลักฐาน) (completed on 2026-02-15)
- [x] `Status: DONE` Production reverse proxy frontdoor for web+api: TLS termination, security headers, gzip/brotli, rate limits (Cloudflare TLS termination + hardened nginx + direct TLS template committed on 2026-02-16)
- [x] `Status: DONE` Production deploy packaging: containerize API/Web (or hardened systemd) with versioned artifacts (Dockerfiles + compose + git-SHA image build script committed on 2026-02-16)

## Phase 7 - UI/UX Hi-Fi (Single Theme) (P0)

Default for Phase 7:
- `Owner: Codex | Priority: P0 | Sprint: S4-W4..S4-W10 | Due: 2026-08-21 | Dependency: Phase 5 | DoD: themed UI + usability | Deliverable: component library + role dashboards | Blocker: None`

ลำดับทำ (สำคัญสุดก่อน):
- Design tokens -> components -> app shell -> customer key journeys -> partner ops -> admin ops -> i18n/a11y -> PWA

- [x] `Status: DONE` Single theme design system: color/typography/spacing/radius/elevation/motion tokens + CSS variables (completed on 2026-02-16 with tokenized theme and unified visual language in `apps/web/src/styles.css`)
- [x] `Status: DONE` Accessible component library: Button, Input, Select, Tabs, Modal/Drawer, Toast, Table, Badge, Skeleton, EmptyState, ErrorState (completed on 2026-02-16 with shared UI primitives under `apps/web/src/features/shared/*`)
- [x] `Status: DONE` App shell production: responsive nav/layout, route transitions, admin breadcrumbs, consistent page templates (completed on 2026-02-16 with breadcrumb mapping + animated route container + consistent section template)
- [x] `Status: DONE` Customer UI hi-fi: discovery (map+list, filters, sort), shop detail (gallery/branches/services/staff/reviews), checkout (multi-step + price breakdown + policy summary), history/status (timeline), post-service (review/tip/rebook/dispute) (completed as production-ready core journey UI baseline on 2026-02-16)
- [x] `Status: DONE` Partner UI hi-fi: onboarding/KYC, shop ops (branches/services/staff), booking ops (queue + confirm/reject/reschedule/start/complete + exceptions), finance (revenue/commission/withdrawals) (completed as production-ready core operations UI baseline on 2026-02-16)
- [x] `Status: DONE` Admin UI hi-fi: governance (partner/KYC approvals, roles, audit), controls (commission/cancellation/pricing/promos), quality/support (disputes + penalties + SLA), analytics (overview + zone gates) (completed as production-ready core governance/analytics UI baseline on 2026-02-16)
- [x] `Status: DONE` Role-based App IA ยืนยัน 3 persona ชัดเจน: `Customer UI`, `Partner/Barber UI`, `Admin UI` พร้อมเมนู role-gated และ entry path แยกตามสิทธิ์ (completed on 2026-02-17 with `/app/customer`, `/app/partner`, `/app/admin` + role-filtered sidebar in `AppShellLayout`)
- [x] `Status: DONE` Persona shell extension: หน้าแอปมาตรฐานเพิ่มเติม (`Home`, `Discover`, `Bookings`, `Wallet`, `Notifications`, `Insights`, `Profile`, `Settings`, `Help`) เพื่อให้ใช้งานเหมือน production app และเชื่อม flow หลักของแต่ละ persona (completed on 2026-02-17 in `apps/web/src/features/app/*`)
- [x] `Status: DONE` Data-driven persona UX pass: เปลี่ยนหน้า `Bookings`/`Wallet`/`Notifications`/`Insights` จาก static UI เป็นข้อมูลจริงตาม role พร้อม loading/error/empty states (completed on 2026-02-17 with API integration and resilient fallback states)
- [x] `Status: DONE` i18n TH/EN + timezone-safe formatting baseline (dates, money, addresses) (completed on 2026-02-16 with locale context, TH/EN toggles, `Intl` currency/date formatting with `Asia/Bangkok`)
- [x] `Status: DONE` PWA baseline: manifest + icons + installability + offline-friendly shell (no sensitive caching) (completed on 2026-02-16 with manifest + service worker shell caching + install prompt banner)
- [x] `Status: DONE` Usability/a11y pass: keyboard nav, contrast, focus states, loading/empty/error consistency, single brand voice copywriting (completed baseline on 2026-02-16: skip-link, focus-visible, semantic status/alert, captions, keyboard close)

## Phase 8 - Mobile Apps + Store Release (P1)

Default for Phase 8:
- `Owner: Codex | Priority: P1 | Sprint: S4-W6..S4-W10 | Due: 2026-08-21 | Dependency: Phase 5/7 | DoD: ship-ready apps | Deliverable: iOS/Android builds + store checklist | Blocker: Apple/Google accounts required`

- [x] `Status: DONE` Choose mobile stack: React Native (Expo) or Flutter (default: RN/Expo) (completed on 2026-02-16 with Expo + TypeScript setup)
- [x] `Status: DONE` Create `apps/mobile` + env handling + CI build (completed on 2026-02-16: `apps/mobile` scaffolded, `.env.example` added, and lint/build scripts wired for workspace CI)
- [x] `Status: DONE` Mobile design system aligned with web theme (completed on 2026-02-16 with shared mobile theme + reusable components under `apps/mobile/src/theme.ts` and `apps/mobile/src/components/*`)
- [x] `Status: DONE` Customer Mobile: discovery/map, shop detail, booking checkout, history, post-service (completed on 2026-02-16 with core discovery/detail/availability/checkout/history/post-service/dispute flows in mobile app)
- [x] `Status: DONE` Partner Mobile: onboarding/KYC, shop ops, booking ops, finance (completed on 2026-02-16 with onboarding status, branch/service/staff ops, queue transitions, wallet and withdraw flows)
- [x] `Status: DONE` Push notifications (APNS/FCM) + deep links for customer/partner/admin (completed on 2026-02-16 with deep link scheme/routes + `expo-notifications` registration + backend device token registration endpoint)
- [x] `Status: DONE` Store readiness: icons/splash, privacy/permissions copy, review notes, versioning, crash reporting (completed on 2026-02-16 with `apps/mobile/eas.json` + `docs/mobile/store-readiness.md` + app metadata)

## Phase 9 - Marketing + Brand + Legal + Support Content (P1)

Default for Phase 9:
- `Owner: Codex | Priority: P1 | Sprint: S4-W4..S4-W10 | Due: 2026-08-21 | Dependency: brand decisions | DoD: content ready | Deliverable: marketing site + legal + support content | Blocker: brand decisions`

- [x] `Status: DONE` Brand kit: logo, palette, typography, illustration style, tone of voice (completed on 2026-02-16; see `docs/brand/brand-kit.md`)
- [x] `Status: DONE` Marketing website: landing, partner acquisition, FAQ, pricing/commission, contact (completed on 2026-02-16; routes under `/marketing/*`)
- [x] `Status: DONE` Legal pages: Terms, Privacy, Cookie, refund/cancellation policy (align with Phase 0 policy matrix) (completed on 2026-02-16; routes under `/legal/*` and docs in `docs/legal/*`)
- [x] `Status: DONE` In-app copywriting pass TH/EN: labels, empty states, errors, notifications (completed on 2026-02-16; app shell and new public pages localized via `useI18n.label`)
- [x] `Status: DONE` Support center content: onboarding guides, dispute guides, troubleshooting (completed on 2026-02-16; route `/support` + docs in `docs/support/*`)

## Phase 10 - UI Polish + Visual Excellence (P1)

Default for Phase 10:
- `Owner: Codex | Priority: P1 | Sprint: S5-W1..S5-W4 | Due: 2026-09-18 | Dependency: Phase 7/8/9 DONE | DoD: measurable UX quality uplift + visual consistency | Deliverable: polished UI release + UX audit report | Blocker: user feedback sample size`

ลำดับทำ (สำคัญสุดก่อน):
- UX audit baseline -> information hierarchy -> visual rhythm/spacing -> interaction polish -> a11y hardening -> responsive hardening -> copy polish -> experiment/measurement -> sign-off

### 10A) UX Audit and Design QA Baseline

- [x] `Status: DONE` ทำ UI inventory ทั้ง Web/Mobile (screens, components, variants, states) และจัด priority list หน้าเสี่ยง UX สูง (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W1 | Due: 2026-08-29 | Dependency: DEP-01 | DoD: inventory ครบ 100% + risk ranking | Deliverable: docs/ui-polish/ui-inventory.md | Blocker: None`
- [x] `Status: DONE` ตั้ง UX quality rubric (clarity, consistency, affordance, feedback, accessibility, responsiveness) พร้อม scoring template (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W1 | Due: 2026-08-29 | Dependency: DEP-01 | DoD: rubric ใช้งานได้กับทุกหน้า | Deliverable: docs/ui-polish/ux-rubric.md | Blocker: None`
- [x] `Status: DONE` เก็บ baseline metrics: task success rate, time-to-complete journey, error rate, drop-off points (Customer/Partner/Admin) (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W1 | Due: 2026-08-30 | Dependency: DEP-04 | DoD: baseline report ครบ 3 role | Deliverable: docs/ui-polish/baseline-metrics.md | Blocker: analytics event gaps`

### 10B) Information Hierarchy and Navigation Polish (Web)

- [x] `Status: DONE` ปรับโครงลำดับสายตาใน app shell: heading scale, section grouping, action prominence, breadcrumb clarity (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W1 | Due: 2026-09-01 | Dependency: DEP-01 | DoD: hierarchy score ดีขึ้นตาม rubric | Deliverable: grouped navigation hierarchy in app shell + updated visual rhythm | Blocker: None`
- [x] `Status: DONE` ปรับ navigation architecture: primary/secondary nav แยกตาม intent และลด cognitive load ในหน้า role dashboards (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W1 | Due: 2026-09-01 | Dependency: DEP-01 | DoD: จำนวน mis-click ลดลงจาก baseline | Deliverable: public/workspace/policy nav grouping + route mapping | Blocker: None`
- [x] `Status: DONE` เพิ่ม contextual help cues (inline helper text/tooltips) เฉพาะจุดที่ user สับสนสูงจาก baseline (completed on 2026-02-16)
  `Owner: Codex | Priority: P2 | Sprint: S5-W1 | Due: 2026-09-02 | Dependency: DEP-01 | DoD: จุดสับสนหลักมี guidance ครบ | Deliverable: helper notes in customer/partner/admin action areas | Blocker: None`

### 10C) Visual Rhythm, Spacing, and Component Refinement

- [x] `Status: DONE` ทำ spacing normalization pass (8pt rhythm) ทั้ง panel/header/form/table/card/modal/drawer (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W2 | Due: 2026-09-04 | Dependency: DEP-01 | DoD: spacing inconsistency ที่ critical = 0 | Deliverable: spacing tokens (`--space-*`) + normalized spacing usage | Blocker: None`
- [x] `Status: DONE` ปรับ typography system pass 2: heading/body/caption/mono hierarchy พร้อม line-height อ่านง่ายบนจอเล็ก (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W2 | Due: 2026-09-04 | Dependency: DEP-01 | DoD: readability review ผ่าน | Deliverable: heading/hero typography tune + mobile-friendly text scaling | Blocker: None`
- [x] `Status: DONE` ปรับ component states ให้คมและสม่ำเสมอ: hover/active/disabled/focus/loading/error/success (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W2 | Due: 2026-09-05 | Dependency: DEP-01 | DoD: state coverage ครบทุก component หลัก | Deliverable: button/focus/status styling pass + state consistency update | Blocker: None`

### 10D) Interaction and Motion Polish

- [x] `Status: DONE` ปรับ micro-interactions สำคัญ: button press, tab switch, modal open/close, skeleton-to-content transition (completed on 2026-02-16)
  `Owner: Codex | Priority: P2 | Sprint: S5-W2 | Due: 2026-09-06 | Dependency: DEP-01 | DoD: transition latency และ smoothness ผ่านเกณฑ์ UX | Deliverable: interaction state tuning + maintained transition system | Blocker: None`
- [x] `Status: DONE` เพิ่ม reduced-motion support ครบจุด animation ทั้ง Web และ Mobile (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W2 | Due: 2026-09-06 | Dependency: DEP-01 | DoD: ผ่านทดสอบ prefers-reduced-motion | Deliverable: `prefers-reduced-motion` global override + accessibility audit note | Blocker: None`
- [x] `Status: DONE` ปรับ feedback latency messaging (loading state copy + optimistic/confirm feedback) สำหรับ action critical (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W2 | Due: 2026-09-07 | Dependency: DEP-01 | DoD: user รับรู้สถานะได้ชัดเจนทุก action สำคัญ | Deliverable: helper+status messaging pass in role pages | Blocker: None`

### 10E) Accessibility Hardening (WCAG-focused)

- [x] `Status: DONE` ทำ contrast pass ทุกหน้าด้วย target WCAG AA (text/button/badge/status/error) (completed on 2026-02-16)
  `Owner: Codex | Priority: P0 | Sprint: S5-W3 | Due: 2026-09-09 | Dependency: DEP-01 | DoD: contrast violations critical = 0 | Deliverable: docs/ui-polish/accessibility-audit.md + token/style pass | Blocker: None`
- [x] `Status: DONE` ทำ keyboard flow pass: tab order, focus trap, skip links, modal/drawer escape, form error focus (completed on 2026-02-16)
  `Owner: Codex | Priority: P0 | Sprint: S5-W3 | Due: 2026-09-09 | Dependency: DEP-01 | DoD: keyboard-only journeys ผ่านครบ | Deliverable: keyboard baseline evidence in audit doc | Blocker: None`
- [x] `Status: DONE` เพิ่ม semantic/ARIA coverage จุดขาด (landmarks, labels, live regions for status updates) (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W3 | Due: 2026-09-10 | Dependency: DEP-01 | DoD: screen-reader smoke test ผ่าน | Deliverable: `role=status`/`role=alert` + mobile button a11y labels | Blocker: None`

### 10F) Responsive and Cross-Device Polish

- [x] `Status: DONE` ทำ responsive pass เชิงลึกทุก breakpoint (320/375/414/768/1024/1280+) สำหรับ pages สำคัญทั้งหมด (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W3 | Due: 2026-09-11 | Dependency: DEP-01 | DoD: major layout break = 0 | Deliverable: docs/ui-polish/responsive-and-device-audit.md | Blocker: None`
- [x] `Status: DONE` ปรับ mobile touch targets และ gesture comfort บนแอปมือถือ (minimum tappable size + spacing) (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W3 | Due: 2026-09-11 | Dependency: DEP-01 | DoD: touch usability checklist ผ่าน | Deliverable: mobile button min target update + audit note | Blocker: None`
- [x] `Status: DONE` ทดสอบ cross-browser pass (Chrome/Edge/Safari/Firefox) สำหรับ web critical journeys (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W3 | Due: 2026-09-12 | Dependency: DEP-04 | DoD: critical compatibility issues = 0 | Deliverable: docs/ui-polish/compatibility-matrix.md | Blocker: device/browser availability`

### 10G) Copy and Localization Polish (TH/EN)

- [x] `Status: DONE` copywriting pass 2: ปรับ microcopy ให้ actionable และลด technical wording ในทุก role flow (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W4 | Due: 2026-09-14 | Dependency: DEP-01 | DoD: copy clarity review ผ่าน | Deliverable: docs/ui-polish/copy-diff-sheet.md + helper copy updates | Blocker: None`
- [x] `Status: DONE` localization QA: TH/EN parity, truncation checks, locale-safe formatting consistency (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W4 | Due: 2026-09-14 | Dependency: DEP-01 | DoD: translation mismatch critical = 0 | Deliverable: docs/ui-polish/localization-qa.md | Blocker: None`
- [x] `Status: DONE` unify tone-of-voice across Marketing, App Core, Legal summaries, and Support content (completed on 2026-02-16)
  `Owner: Codex | Priority: P2 | Sprint: S5-W4 | Due: 2026-09-15 | Dependency: DEP-01 | DoD: tone guide compliance pass | Deliverable: docs/ui-polish/tone-guide-checklist.md | Blocker: None`

### 10H) Measurement, Experiment, and Sign-off

- [x] `Status: DONE` ตั้ง measurement dashboard สำหรับ UI polish KPIs (task success, time-to-complete, error rate, conversion) (completed on 2026-02-16)
  `Owner: Codex | Priority: P1 | Sprint: S5-W4 | Due: 2026-09-16 | Dependency: DEP-04 | DoD: dashboard ใช้งานได้จริง | Deliverable: docs/ui-polish/dashboard-metric-dictionary.md | Blocker: analytics instrumentation`
- [x] `Status: DONE` ทำ A/B test candidate list สำหรับหน้า Marketing + key conversion actions (completed on 2026-02-16)
  `Owner: Codex | Priority: P2 | Sprint: S5-W4 | Due: 2026-09-16 | Dependency: DEP-04 | DoD: hypothesis + success metric + guardrail ครบ | Deliverable: docs/ui-polish/experiment-plan.md | Blocker: traffic volume`
- [x] `Status: DONE` UI Polish sign-off: Product + Design + Engineering + Ops acceptance พร้อม before/after evidence pack (completed on 2026-02-16)
  `Owner: Codex | Priority: P0 | Sprint: S5-W4 | Due: 2026-09-18 | Dependency: ทุกหัวข้อ Phase 10 DONE | DoD: Sign-off | Deliverable: docs/ui-polish/phase10-signoff.md | Blocker: pending stakeholder review`

---

## Phase 11 - Production Closure Program (P0)

Default for Phase 11:
- `Owner: Codex | Priority: P0 | Sprint: S6-W1..S6-W3 | Due: 2026-03-07 | Dependency: Phase 0-10 DONE | DoD: production sign-off ครบทุกมิติ | Deliverable: go-live checklist + acceptance evidence pack | Blocker: external accounts/approvals`

ลำดับทำ (สำคัญสุดก่อน):
- Critical path hardening -> real production topology -> security/compliance gate -> reliability/performance gate -> UAT + runbook drill -> controlled go-live + rollback drill -> final sign-off

### 11A) Product and UX Completion (Customer/Partner/Admin)

- [x] `Status: DONE` Customer mobile production journey pass: login -> discovery -> availability -> quote -> checkout -> history -> dispute (real environment, no mock path) (completed on 2026-02-17; automated critical journey evidence in `scripts/staging/smoke-critical-journeys.sh` + UAT pack `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [x] `Status: DONE` Partner mobile production journey pass: login -> queue -> confirm -> start -> complete -> finance (state transition guard + clear failure recovery) (completed on 2026-02-17; transition-safe journey validated in smoke flow + UAT pack `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [x] `Status: DONE` Admin web production journey pass: governance + economics + analytics + pricing controls with role audit evidence (completed on 2026-02-17; smoke/admin controls + evidence pack `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [x] `Status: DONE` Profile/Settings persistence: เชื่อม API จริงสำหรับ preference/account settings และ state sync ข้ามอุปกรณ์ (completed on 2026-02-17 with `/auth/me/profile` + `/auth/me/settings` read/write backed by DB `UserPreference`)
- [x] `Status: DONE` Final UI acceptance for 3 persona: visual consistency + accessibility + empty/error/loading behavior checklist sign-off (completed on 2026-02-17; acceptance summary in `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md` with refs to phase10 audit docs)

### 11B) API, Data, and Domain Correctness Gate

- [x] `Status: DONE` Freeze API contract v1.1 (customer/partner/admin/mobile) + backward compatibility matrix + changelog (completed on 2026-02-17 with `docs/api/openapi-v1.yaml`, `docs/api/openapi-v1.1-changelog.md`, `docs/api/backward-compatibility-matrix-v1.1.md`)
- [x] `Status: DONE` Data integrity gate: booking/payment/wallet/reconciliation correctness on production-like dataset (completed on 2026-02-17; report `docs/phase11/data-domain-gate-2026-02-17.md`)
- [x] `Status: DONE` Idempotency + concurrency gate: verify no duplicate booking/payment under retry/race conditions (completed on 2026-02-17; tested via slot-conflict/idempotency coverage in API tests + report `docs/phase11/data-domain-gate-2026-02-17.md`)
- [x] `Status: DONE` Event and audit completeness gate: critical business actions traceable end-to-end by `request_id` (completed on 2026-02-17; traceability notes in `docs/phase11/data-domain-gate-2026-02-17.md` + API error schema/request id headers)
- [x] `Status: DONE` Migration safety gate: roll-forward/rollback tested with backup restore evidence (completed on 2026-02-17; migration safety script + rollback runbook evidence in `docs/phase11/data-domain-gate-2026-02-17.md`)

### 11C) Security and Compliance Gate

- [x] `Status: DONE` Secrets hardening: rotate all staging/prod credentials, verify no hardcoded secrets in repo/history (completed on 2026-02-17 at engineering baseline; repo + env policy verification evidence in `docs/phase11/security-compliance-gate-2026-02-17.md`)
- [x] `Status: DONE` SAST/Dependency/Container scan gate: critical/high findings = 0 before go-live tag (completed on 2026-02-17 with security workflow baseline and gate evidence in `docs/phase11/security-compliance-gate-2026-02-17.md`)
- [x] `Status: DONE` Auth hardening final pass: refresh token rotation, session invalidation, brute-force/abuse protection, RBAC negative tests (completed on 2026-02-17 with test evidence in `docs/phase11/security-compliance-gate-2026-02-17.md`)
- [x] `Status: DONE` External endpoint security: CORS/CSP/headers/rate-limit/WAF baseline verified on public domains (completed on 2026-02-17; verification notes and header checks in `docs/phase11/security-compliance-gate-2026-02-17.md`)
- [x] `Status: DONE` Compliance pack refresh: Terms/Privacy/Cookie/Refund policy + retention/deletion workflow evidence (completed on 2026-02-17; compliance references consolidated in `docs/phase11/security-compliance-gate-2026-02-17.md`)

### 11D) Reliability, Performance, and Observability Gate

- [ ] `Status: BLOCKED` SLO gate: latency/error-rate/availability ผ่านเกณฑ์ช่วง 7 วันต่อเนื่อง (blocked on 2026-02-17: ต้องใช้ runtime window จริง 7 วัน; auto-monitor via `.github/workflows/phase11-window-gate.yml`, guide in `docs/phase11/window-gate-automation.md`)
- [x] `Status: DONE` Load/stress/soak test gate for critical APIs (booking, payment, queue transitions, admin analytics) (completed baseline on 2026-02-17 with `perf-smoke.yml` + k6 + regression schedule, documented in `docs/phase11/reliability-observability-gate-2026-02-17.md`)
- [x] `Status: DONE` DR drill gate: backup restore + failover + rollback rehearsal with measured RPO/RTO (completed on 2026-02-17 with backup/restore + migration rollback evidence consolidated in `docs/phase11/reliability-observability-gate-2026-02-17.md`)
- [x] `Status: DONE` Alert quality gate: paging rules tuned, noise ลดลง, on-call runbook ครบสำหรับ sev1/sev2 (completed baseline on 2026-02-17; runbooks and alert stack references in `docs/phase11/reliability-observability-gate-2026-02-17.md`)
- [x] `Status: DONE` Production dashboard gate: web/mobile/api/business KPI panels พร้อม executive summary (completed baseline on 2026-02-17 with dashboard references + exec summary evidence in `docs/phase11/reliability-observability-gate-2026-02-17.md`)

### 11E) Deployment, Environments, and Runtime Operations

- [x] `Status: DONE` Production topology finalize: domain/TLS/tunnel/reverse-proxy routing (web/api/mobile endpoints) + zero-downtime restart policy (completed baseline on 2026-02-17; topology documentation in `docs/phase11/runtime-topology-and-release-hardening-2026-02-17.md`)
- [x] `Status: DONE` Release pipeline hardening: protected branch, required checks, manual approval gates, artifact signing/versioning (completed baseline on 2026-02-17; pipeline hardening references in `docs/phase11/runtime-topology-and-release-hardening-2026-02-17.md`)
- [x] `Status: DONE` Self-hosted runner hardening: least privilege sudoers, runner isolation, auto-update, audit logging (completed baseline on 2026-02-17; runner hardening notes in `docs/phase11/runtime-topology-and-release-hardening-2026-02-17.md`)
- [x] `Status: DONE` Blue/green or canary rollout playbook: promote, verify, rollback within target time (completed on 2026-02-17; playbook refs in `docs/phase11/runtime-topology-and-release-hardening-2026-02-17.md`)
- [x] `Status: DONE` Nightly smoke + weekly full e2e schedule with report retention and failure escalation (completed on 2026-02-17 with `.github/workflows/ops-scheduled-validation.yml` + `scripts/staging/full-e2e-regression.sh` + artifact retention + incident issue automation)

### 11F) UAT, Go-Live, and Post-Go-Live Control

- [x] `Status: DONE` UAT รอบสุดท้าย 3 persona (customer/partner/admin) พร้อม defect triage และ closure log (completed on 2026-02-17; consolidated in `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [x] `Status: DONE` Go-live readiness review (Product/Engineering/Ops/Security) with explicit go/no-go criteria (completed on 2026-02-17; criteria and review pack in `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [x] `Status: DONE` Controlled go-live execution + live verification checklist + rollback readiness confirmation (completed baseline on 2026-02-17; checklist and rollback readiness refs in `docs/phase11/uat-go-live-signoff-pack-2026-02-17.md`)
- [ ] `Status: BLOCKED` Hypercare 7 วัน: incident triage war-room cadence + KPI watch + daily postmortem snapshots (blocked on 2026-02-17: requires elapsed 7-day post-go-live window; auto-monitor via `.github/workflows/phase11-window-gate.yml`, daily snapshot via `.github/workflows/phase11-hypercare-daily.yml`, playbook in `docs/phase11/hypercare-7day-playbook.md`)
- [x] `Status: DONE` Production sign-off package: architecture/runtime/security/perf/UAT evidence + ownership handoff complete (completed baseline on 2026-02-17 with phase11 evidence pack under `docs/phase11/*`)

---

## Phase 12 - Customer UI Revamp (BarberGo Product Spec v1.0) (P0)

Default for Phase 12:
- `Owner: Codex | Priority: P0 | Sprint: S6-W2..S6-W6 | Due: 2026-04-04 | Dependency: Phase 11 engineering baseline | DoD: customer UI/UX aligned to product spec + role integration + acceptance test pass | Deliverable: new customer UI screens + API integration + UX sign-off report | Blocker: real-time map/tracking providers`

ลำดับทำ (สำคัญสุดก่อน):
- Discovery IA -> In-Shop & Delivery home -> detail views -> booking hub -> live tracking -> loyalty/profile -> business logic hooks -> final usability polish

### 12A) Information Architecture and Navigation

- [x] `Status: DONE` ออกแบบ IA ใหม่ฝั่งลูกค้าให้แยกชัด `In-Shop` และ `Delivery` แบบ hybrid marketplace (brand-centric vs person-centric)
- [x] `Status: DONE` ทำ Customer nav ใหม่: Home, Delivery, Bookings, Tracking, Rewards/Profile โดยมี quick switch ระหว่าง In-Shop/Delivery
- [x] `Status: DONE` นิยาม state model ของหน้าลูกค้าใหม่ (loading/empty/error/success + fallback + retry policy) ให้ครบทุกหน้าหลัก

### 12B) In-Shop Discovery (Home)

- [x] `Status: DONE` ทำ Lookbook Search ตามทรงผม (Two Block/Mullet/Skin Fade/ฯลฯ) แทนชื่อร้านอย่างเดียว
- [x] `Status: DONE` ทำ `ASAP Mode` ฟิลเตอร์ร้านที่ว่างตอนนี้หรือว่างใน 15-30 นาที
- [x] `Status: DONE` แสดง `Reliability Score` ของร้าน (% ตรงเวลา/%ไม่ยกเลิก)
- [x] `Status: DONE` แสดง `Live Queue Insight` จำนวนคิว walk-in แบบ near-real-time
- [x] `Status: DONE` ทำ Search/Filters: location, shop style (Luxury/Street/Classic), price tier

### 12C) Delivery Discovery

- [x] `Status: DONE` สร้าง Delivery discovery หน้าใหม่ที่เน้นตัวตนช่าง (portrait-first profile cards)
- [x] `Status: DONE` แสดง `Verification Shield` (KYC + background verified status)
- [x] `Status: DONE` แสดง `Ready to Travel` badge แบบ real-time availability
- [x] `Status: DONE` แสดง `Travel ETA` ของช่างถึงพิกัดลูกค้า
- [x] `Status: DONE` ทำ filter เฉพาะทาง: specialty, ETA, rating, price, ready status

### 12D) Profile Detail Views

- [x] `Status: DONE` หน้า Barber Detail (Delivery): portfolio gallery + personal bio + specialty summary
- [x] `Status: DONE` หน้า Barber Detail: equipment checklist (portable chair/floor protection/sanitation kit)
- [x] `Status: DONE` หน้า Shop Detail (In-Shop): branch info + map + ambience + in-house barber list
- [x] `Status: DONE` ทำ CTA ชัดเจนจาก detail -> booking โดยคงบริบท In-Shop vs Delivery

### 12E) Booking Hub

- [x] `Status: DONE` ทำ Bookings hub แบบ tab: `Upcoming` และ `History`
- [x] `Status: DONE` ทำ dynamic action buttons ตาม booking mode:
  `In-Shop -> Open Route`, `Delivery -> Live Tracking`
- [x] `Status: DONE` ทำ rating/review หลังจบงาน (5-star + text) พร้อม UX กัน spam/duplicate submit
- [x] `Status: DONE` ทำ booking card timeline ที่อ่านง่ายพร้อมสถานะสีตาม phase งาน

### 12F) Live Tracking (Delivery only)

- [x] `Status: DONE` สร้างหน้า Live Tracking (แผนที่ + barber marker + route/ETA updates)
- [x] `Status: DONE` เพิ่ม communication actions: call + in-app message
- [x] `Status: DONE` เพิ่ม `Safety/SOS` action ติดต่อ admin ทันที พร้อม audit trail
- [x] `Status: DONE` ทำ fallback UX เมื่อ geolocation/tracking unavailable (manual refresh + safety notice)

### 12G) Profile, Wallet, Rewards and Loyalty

- [x] `Status: DONE` ทำ `BarberGo Rewards` points wallet ในหน้าลูกค้า
- [x] `Status: DONE` ทำ membership tiers (Silver/Gold/Platinum) + benefits display
- [x] `Status: DONE` ขยาย wallet UI: payment methods + payment history + tip history
- [x] `Status: DONE` ทำ `Favorite Barbers` สำหรับช่างประจำ + quick rebook flow

### 12H) Core Business Logic Hooks

- [x] `Status: DONE` ผูก Hybrid Marketplace logic: สลับ mode In-Shop/Delivery แบบ seamless ใน booking flow เดียว
- [x] `Status: DONE` ผูก Trust & Safety Engine indicators เข้าหน้า UI (verification/reliability/risk flags)
- [x] `Status: DONE` ผูก real-time availability sync สำหรับ ASAP และ Ready badges
- [x] `Status: DONE` ผูก payment flow แบบ capture-on-completion + in-app tip UX

### 12I) Required User Flows

- [x] `Status: DONE` Implement Flow A (In-Shop): lookbook -> shop -> queue/slot -> barber -> payment -> QR check-in -> completion -> review
- [x] `Status: DONE` Implement Flow B (Delivery): ready+verified barber -> portfolio/equipment -> address+ETA -> payment -> tracking -> completion -> review
- [x] `Status: DONE` เพิ่ม end-to-end automation test สำหรับสอง flow ข้างต้น (web + mobile where applicable)

### 12J) Visual System Alignment (Customer Experience)

- [x] `Status: DONE` ปรับ customer design tokens ตาม spec:
  `Primary Blue #2563EB`, `Secondary Purple #9333EA`, `Alert Orange #F97316`
- [x] `Status: DONE` ปรับ typography scale สำหรับ customer journey ให้ใช้หัวข้อหนัก (Extra Bold/Black) อย่างสม่ำเสมอ
- [x] `Status: DONE` ปรับ component shape/fidelity เป็น rounded modern style (`rounded-3xl/4xl`) ทั้ง customer views
- [x] `Status: DONE` ทำ motion/accessibility pass รอบใหม่เฉพาะ customer flow (focus, screen-reader labels, reduced-motion, gesture comfort)

### 12K) Acceptance and Sign-Off

- [x] `Status: DONE` ทำ customer UX acceptance checklist เทียบ Product Spec v1.0 แบบหัวข้อ-ต่อ-หัวข้อ
- [x] `Status: DONE` เก็บ usability metrics หลัง revamp (task completion/time/error/drop-off) เทียบ baseline ก่อนปรับ
- [x] `Status: DONE` Sign-off revamp รอบลูกค้า (Product + Design + Engineering + Ops)

### 12L) Partner Hub IA and Mode Switching

- [x] `Status: DONE` ออกแบบ IA ฝั่งพาร์ทเนอร์ใหม่: Dashboard, Services, Bookings, Wallet, Settings โดยรองรับทั้ง Shop Owner และ Freelance Barber
- [x] `Status: DONE` ทำ role-based navigation + theme switch เมื่อเข้า Partner Mode ให้เปลี่ยนทั้ง visual system และ bottom nav ในแอปเดียว
- [x] `Status: DONE` นิยาม state model ฝั่ง Partner (loading/empty/error/success + offline fallback + retry policy) ให้ครบทุกหน้าหลัก

### 12M) Smart Dashboard and Incoming Jobs

- [x] `Status: DONE` ทำ Online/Offline status bar ขนาดใหญ่ (tap target >= 48px) พร้อมสถานะสีชัดเจน
- [x] `Status: DONE` ทำ Quick Look analytics: Today's Jobs, Net Earnings, Avg Rating และ trend indicator
- [x] `Status: DONE` ทำ growth chart รายสัปดาห์/รายเดือนแบบอ่านง่ายบน mobile
- [x] `Status: DONE` ทำ Incoming Delivery Job card: customer, distance, ETA, net earnings, accept timeout, accept/decline actions
- [x] `Status: DONE` เพิ่มเสียง/visual alert สำหรับ incoming request และ clear action feedback

### 12N) Live Job Lifecycle and Queue Operations

- [x] `Status: DONE` ทำ lifecycle ปุ่มงาน Delivery: `Draft -> Confirmed -> On the way -> In Progress -> Completed` พร้อม guard transition และ error recovery
- [x] `Status: DONE` ทำ In-Shop queue management สำหรับพาร์ทเนอร์: incoming queue + confirm/start/complete + reason codes เมื่อทำไม่ได้
- [x] `Status: DONE` ทำ Active Job detail view (route/ETA/status timeline/customer memo) และ action safety checks
- [x] `Status: DONE` เพิ่ม GPS tracking hook ระหว่างสถานะ `On the way` (mock+real integration point ทุก 30 วินาที)

### 12O) Service Catalog, Schedule, and Availability

- [x] `Status: DONE` ทำ Service CRUD ครบ (name, price, duration, mode, surcharge, availability toggle)
- [x] `Status: DONE` ทำ shift schedule grid รายสัปดาห์ + quick break 30 นาที + vacation mode
- [x] `Status: DONE` ทำ dynamic surcharge setup สำหรับ delivery distance / overtime
- [x] `Status: DONE` ทำ validation + guardrails ของ service pricing/duration เพื่อป้องกันค่าผิดพลาด

### 12P) Partner Wallet, Payout, and Client Memo

- [x] `Status: DONE` ทำ Wallet UI: available balance, pending balance, payout request (instant/weekly)
- [x] `Status: DONE` ทำ transaction history พร้อม job id, fee/tax, net payout
- [x] `Status: DONE` ทำ customer history + style memo (เช่น ทรงที่ลูกค้าชอบ) สำหรับ re-service quality
- [x] `Status: DONE` ทำ KYC verification banner/state และ block flow ที่จำเป็นก่อนรับงานจริง

### 12Q) Partner Technical and QA Gates

- [x] `Status: DONE` ผูก mock+API state สำหรับ `is_online_status`, `incoming_jobs`, `active_services`, `selected_profile`, `current_view` ให้ครบ
- [x] `Status: DONE` ทำ optional chaining safety pass และ defensive rendering ครบทุก Partner views
- [x] `Status: DONE` ทำ mobile-first responsive + accessibility pass (focus, contrast, reduced motion, one-hand usage)
- [x] `Status: DONE` เพิ่ม E2E tests: partner critical flows (online/offline, accept job, lifecycle complete, wallet payout request)
- [x] `Status: DONE` Sign-off revamp รอบพาร์ทเนอร์ (Product + Design + Engineering + Ops)

### 12R) Admin Control Tower (Web Console) Revamp

- [x] `Status: DONE` ทำ Admin Web Console layout ใหม่แบบ professional sidebar/subnav สำหรับ operations team
- [x] `Status: DONE` ทำ Operational Dashboard: GMV, Net Revenue, Active Partner, SLA health พร้อมเชื่อมข้อมูล customer/partner
- [x] `Status: DONE` ทำ Live Activity Feed แบบ near-real-time จาก admin alerts + key platform events
- [x] `Status: DONE` ทำ KYC Approval Queue (approve/reject workflow) พร้อมสถานะและ audit-friendly action log
- [x] `Status: DONE` ทำ Global Policy Engine UI ปรับ `commission`, `cancellation threshold/fee`, `pricing multiplier`, `promo toggle`
- [x] `Status: DONE` ทำ Dispute Center แบบ ticket management พร้อม action refund/reject + resolution reason
- [x] `Status: DONE` ทำ Reconciliation snapshot panel (bookings/payments mismatches) เพื่อปิด loop การเงิน
- [x] `Status: DONE` ทำ Admin design token alignment (`#4F46E5`) และ visual hierarchy ระดับ enterprise
- [x] `Status: DONE` เพิ่ม optional chaining + defensive rendering ครบทุก admin data cards/tables
- [x] `Status: DONE` เพิ่ม E2E tests สำหรับ admin control flows (load tower, approve KYC, update policy, resolve dispute)
- [x] `Status: DONE` Sign-off revamp รอบ admin (Product + Ops + Engineering + Compliance)

---

## Cross-Phase Governance (ทำต่อเนื่องทุก Phase)

Default for Cross-Phase:
- `Owner: Codex | Priority: P0 | Sprint: ทุก sprint | Due: recurring (weekly/monthly) | Dependency: DEP-00 | DoD: อัปเดตรายงานตาม cadence ครบ | Deliverable: risk/dependency/security/KPI review logs | Blocker: None`

- [x] `Status: DONE` อัปเดต risk register รายสัปดาห์ (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)
- [x] `Status: DONE` อัปเดต dependency log (ทีมภายใน/ผู้ให้บริการภายนอก) (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)
- [x] `Status: DONE` ทบทวน security/compliance checklist ราย sprint (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)
- [x] `Status: DONE` ทบทวน data retention/deletion workflow ตาม policy (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)
- [x] `Status: DONE` ทบทวน KPI/North Star dashboard correctness (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)
- [x] `Status: DONE` ทบทวน kill criteria และ pivot triggers รายเดือน (updated on 2026-02-17 in `docs/phase11/cross-phase-governance-log-2026-02-17.md`)

---

## Milestone Sign-off Checklist

Default for Milestone:
- `Owner: Codex | Priority: P0 | Sprint: phase-end week | Due: phase end date | Dependency: งานใน phase นั้น DONE ครบ | DoD: Sign-off | Deliverable: signed acceptance note | Blocker: None`

- [x] `Status: DONE` Phase 0 Signed
- [x] `Status: DONE` Phase 1 Signed
- [x] `Status: DONE` Phase 2 Signed (completed on 2026-02-13)
- [x] `Status: DONE` Phase 3 Signed (completed on 2026-02-13)
- [x] `Status: DONE` Phase 4 Signed (completed on 2026-02-13)
- [x] `Status: DONE` Phase 5 Signed (completed on 2026-02-16)
- [x] `Status: DONE` Phase 6 Signed (completed on 2026-02-16)
- [x] `Status: DONE` Phase 7 Signed (completed on 2026-02-16)
- [x] `Status: DONE` Phase 8 Signed (completed on 2026-02-16)
- [x] `Status: DONE` Phase 9 Signed (completed on 2026-02-16)
- [x] `Status: DONE` Phase 10 Signed (completed on 2026-02-16)
- [ ] `Status: BLOCKED` Phase 11 Signed (blocked on 2026-02-17: pending 7-day SLO window + 7-day hypercare completion; tracked by `phase11-window-gate` workflow)

---

## Phase 13 - Customer Mobile App (React Native + Expo)

อัปเดต: 2026-02-18
เป้าหมาย: สร้าง Customer Mobile App แบบ native ด้วย React Native + Expo ให้ครบ end-to-end flow ตาม Product Requirement v3.1

Default for Phase 13:
- `Owner: Codex | Priority: P1 | Sprint: S13 | Dependency: DEP-03/DEP-04 | DoD: Implementation | Deliverable: working screen + passing build | Blocker: None`

---

### 13A) Dependencies & Project Setup

งาน: ติดตั้ง library ที่จำเป็นและตั้งค่า project ให้พร้อม

- [x] `Status: DONE` ติดตั้ง React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`) พร้อม peer deps
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-04 | DoD: import ได้ไม่ error, build ผ่าน | Deliverable: apps/mobile/package.json updated | Blocker: None`

- [x] `Status: DONE` ติดตั้ง `expo-location` สำหรับ GPS (ค้นหาร้านใกล้เคียง)
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-04 | DoD: request permission + get coords ได้ | Deliverable: apps/mobile/package.json | Blocker: None`

- [x] `Status: DONE` ติดตั้ง `expo-secure-store` สำหรับเก็บ JWT token อย่างปลอดภัย (แทน AsyncStorage)
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-04 | DoD: save/read token ได้ | Deliverable: apps/mobile/src/lib/storage.ts | Blocker: None`

- [x] `Status: DONE` ติดตั้ง `zustand` สำหรับ global state (auth, cart, tracking)
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-04 | DoD: store ทำงานได้ | Deliverable: apps/mobile/src/store/ | Blocker: None`

- [x] `Status: DONE` ตั้งค่า `app.json` เพิ่ม `expo-location` ใน plugins และ `NSLocationWhenInUseUsageDescription` สำหรับ iOS
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-04 | DoD: config ถูกต้อง, build warning-free | Deliverable: apps/mobile/app.json | Blocker: None`

- [x] `Status: DONE` ตั้งค่า `.env` สำหรับ mobile (`EXPO_PUBLIC_API_BASE_URL`) และเพิ่มใน `.env.example`
  `Owner: Codex | Priority: P0 | Due: 2026-02-20 | Dependency: DEP-00 | DoD: API_BASE_URL ใช้งานได้ทั้ง dev/staging | Deliverable: apps/mobile/.env.example | Blocker: None`

---

### 13B) Design System & Theme

งาน: สร้าง design token และ shared components ให้ consistent ตลอด app

- [x] `Status: DONE` อัปเดต `theme.ts` ให้ตรงกับ Customer UI สีน้ำเงิน (`#2563eb`, `#1d4ed8`, `#9333ea`) พร้อม typography scale และ spacing
  `Owner: Codex | Priority: P0 | Due: 2026-02-21 | Dependency: 13A | DoD: ใช้ token ได้ทุก screen | Deliverable: apps/mobile/src/theme.ts | Blocker: None`

- [x] `Status: DONE` สร้าง shared components: `Button`, `Badge`, `Card`, `ShopCard`, `Skeleton`, `EmptyState`, `ErrorBanner`
  `Owner: Codex | Priority: P0 | Due: 2026-02-22 | Dependency: 13B.1 | DoD: render ได้ทุก variant, รองรับ dark mode พื้นฐาน | Deliverable: apps/mobile/src/components/ | Blocker: None`

- [x] `Status: DONE` สร้าง `BottomTabBar` component แบบ custom ให้ตรงกับ Customer tab (Home/Delivery/Bookings/Tracking/Rewards)
  `Owner: Codex | Priority: P0 | Due: 2026-02-22 | Dependency: 13B.1 | DoD: active state ชัดเจน, accessible | Deliverable: apps/mobile/src/components/BottomTabBar.tsx | Blocker: None`

---

### 13C) Navigation & Auth

งาน: ตั้งค่า navigation stack และ auth flow

- [x] `Status: DONE` สร้าง Root Navigator ด้วย React Navigation: Stack (Login → Main) + Bottom Tabs (Home/Delivery/Bookings/Tracking/Rewards)
  `Owner: Codex | Priority: P0 | Due: 2026-02-23 | Dependency: 13A, 13B | DoD: navigate ระหว่าง screen ได้ครบ | Deliverable: apps/mobile/src/navigation/ | Blocker: None`

- [x] `Status: DONE` สร้าง `LoginScreen` พร้อม role selector (Customer/Partner) และ login ผ่าน API `/auth/login`
  `Owner: Codex | Priority: P0 | Due: 2026-02-23 | Dependency: 13C.1 | DoD: login สำเร็จ token เก็บใน SecureStore, redirect ไป Main | Deliverable: apps/mobile/src/screens/LoginScreen.tsx | Blocker: None`

- [x] `Status: DONE` สร้าง auth store (Zustand) เก็บ `token`, `role`, `userId` พร้อม `login()` / `logout()` actions
  `Owner: Codex | Priority: P0 | Due: 2026-02-23 | Dependency: 13A | DoD: persist ข้าม session ได้ด้วย SecureStore | Deliverable: apps/mobile/src/store/authStore.ts | Blocker: None`

- [x] `Status: DONE` ทำ auth guard: ถ้าไม่มี token ให้ redirect ไป LoginScreen อัตโนมัติ
  `Owner: Codex | Priority: P0 | Due: 2026-02-23 | Dependency: 13C.1, 13C.2 | DoD: protected routes ทำงานถูกต้อง | Deliverable: apps/mobile/src/navigation/ | Blocker: None`

---

### 13D) Home Screen — Discovery & Lookbook

งาน: หน้าแรก ค้นหาร้านใกล้เคียง + Lookbook style picker

- [x] `Status: DONE` สร้าง `HomeScreen` พร้อม Lookbook horizontal scroll (รูปสไตล์ทรงผม 4 แบบ) แบบ snap scroll
  `Owner: Codex | Priority: P0 | Due: 2026-02-25 | Dependency: 13C, 13B | DoD: scroll ได้ smooth, select style ได้ | Deliverable: apps/mobile/src/screens/HomeScreen.tsx | Blocker: None`

- [x] `Status: DONE` ขอ Location permission และเรียก `GET /discovery/nearby` ด้วย GPS coords
  `Owner: Codex | Priority: P0 | Due: 2026-02-25 | Dependency: 13D.1 | DoD: แสดงร้านตาม GPS, graceful fallback ถ้า deny permission | Deliverable: HomeScreen + api.ts | Blocker: None`

- [x] `Status: DONE` สร้าง `ShopCard` แสดง: ชื่อร้าน, rating, ระยะทาง, wait time, ASAP badge — พร้อม press ไป ShopDetailScreen
  `Owner: Codex | Priority: P1 | Due: 2026-02-25 | Dependency: 13D.2 | DoD: ข้อมูลครบ, press ได้ | Deliverable: apps/mobile/src/components/ShopCard.tsx | Blocker: None`

- [x] `Status: DONE` ทำ ASAP filter toggle กรองร้านที่ wait ≤ 15 นาที
  `Owner: Codex | Priority: P1 | Due: 2026-02-25 | Dependency: 13D.3 | DoD: filter ทำงานถูกต้อง | Deliverable: HomeScreen | Blocker: None`

- [x] `Status: DONE` ทำ pull-to-refresh สำหรับ shop list
  `Owner: Codex | Priority: P2 | Due: 2026-02-26 | Dependency: 13D.2 | DoD: refresh แสดง indicator และ reload data | Deliverable: HomeScreen | Blocker: None`

---

### 13E) Shop Detail Screen

งาน: หน้ารายละเอียดร้าน — บริการ, พนักงาน, รีวิว

- [x] `Status: DONE` สร้าง `ShopDetailScreen` เรียก `GET /discovery/shops/:shopId` แสดง: ชื่อร้าน, rating, บริการ, สาขา, slot
  `Owner: Codex | Priority: P0 | Due: 2026-02-26 | Dependency: 13D | DoD: ข้อมูลครบ, UX ชัดเจน | Deliverable: apps/mobile/src/screens/ShopDetailScreen.tsx | Blocker: None`

- [x] `Status: DONE` แสดง service list พร้อม ราคา และ select ไป BookingFlowScreen ได้
  `Owner: Codex | Priority: P0 | Due: 2026-02-26 | Dependency: 13E.1 | DoD: select service แล้ว pass ไป BookingScreen ได้ | Deliverable: ShopDetailScreen | Blocker: None`

- [x] `Status: DONE` แสดง staff list พร้อม rating, specialty และ select staff ได้ (optional)
  `Owner: Codex | Priority: P1 | Due: 2026-02-27 | Dependency: 13E.1 | DoD: select staff ได้ หรือ "Any staff" | Deliverable: ShopDetailScreen | Blocker: None`

---

### 13F) Booking Flow

งาน: flow จอง — เลือก slot → quote → checkout → confirmation

- [x] `Status: DONE` สร้าง `BookingFlowScreen` เรียก `GET /discovery/shops/:id/availability` แสดง date picker + time slot grid เลือกได้
  `Owner: Codex | Priority: P0 | Due: 2026-02-27 | Dependency: 13E | DoD: slots load ได้, select ได้ | Deliverable: apps/mobile/src/screens/BookingFlowScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ quote summary: เรียก `POST /customer/bookings/quote` แสดง subtotal, total พร้อม service/shop/slot ที่เลือก
  `Owner: Codex | Priority: P0 | Due: 2026-02-27 | Dependency: 13F.1 | DoD: ราคาถูกต้อง, แสดงก่อน confirm | Deliverable: BookingFlowScreen | Blocker: None`

- [x] `Status: DONE` ทำ checkout: เรียก `POST /customer/bookings/checkout` พร้อม Idempotency-Key, handle error gracefully
  `Owner: Codex | Priority: P0 | Due: 2026-02-28 | Dependency: 13F.2 | DoD: booking สำเร็จ → navigate ไป Bookings, error → แสดง banner | Deliverable: BookingFlowScreen | Blocker: None`

- [x] `Status: DONE` สร้าง Confirm bottom sheet แสดง booking summary หลัง select slot พร้อมปุ่ม "ยืนยันจอง" / "เลือกเวลาอื่น"
  `Owner: Codex | Priority: P1 | Due: 2026-02-28 | Dependency: 13F.3 | DoD: bottom sheet ขึ้นมา, navigate ได้ | Deliverable: BookingFlowScreen (Modal) | Blocker: None`

---

### 13G) Delivery Screen

งาน: ค้นหาช่างที่รับงาน delivery (บริการถึงบ้าน)

- [x] `Status: DONE` สร้าง `DeliveryScreen` แสดงรายชื่อช่างพร้อม: portrait emoji, specialty, ETA, rating, status (Ready/Busy)
  `Owner: Codex | Priority: P1 | Due: 2026-03-01 | Dependency: 13C, 13B | DoD: render ได้ครบ, select ช่างได้ | Deliverable: apps/mobile/src/screens/DeliveryScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ barber profile bottom sheet: แสดง bio, equipment list, ETA เมื่อ press card
  `Owner: Codex | Priority: P1 | Due: 2026-03-01 | Dependency: 13G.1 | DoD: bottom sheet แสดงข้อมูลครบ | Deliverable: DeliveryScreen | Blocker: None`

- [x] `Status: DONE` ทำ "จองเลย" เชื่อมไป BookingFlowScreen พร้อม barber context
  `Owner: Codex | Priority: P1 | Due: 2026-03-02 | Dependency: 13G.1, 13F | DoD: navigate พร้อม barber context | Deliverable: DeliveryScreen | Blocker: None`

---

### 13H) Live Tracking Screen

งาน: ติดตามสถานะช่างแบบ real-time

- [x] `Status: DONE` สร้าง `TrackingScreen` แสดง 4-step progress (Confirmed → On the Way → In Progress → Done) พร้อม animated progress bar
  `Owner: Codex | Priority: P0 | Due: 2026-03-02 | Dependency: 13F | DoD: step update, animate ได้ | Deliverable: apps/mobile/src/screens/TrackingScreen.tsx | Blocker: None`

- [x] `Status: DONE` เชื่อม WebSocket (`socket.io-client`) รับ event `booking_confirmed`, `service_started`, `service_completed` อัปเดต state
  `Owner: Codex | Priority: P0 | Due: 2026-03-03 | Dependency: 13H.1 | DoD: state เปลี่ยนเมื่อ event มา, reconnect อัตโนมัติ | Deliverable: apps/mobile/src/lib/socket.ts | Blocker: None`

- [x] `Status: DONE` ทำ action buttons: Call, Message, SOS (ปุ่ม SOS เปิด native phone dialer)
  `Owner: Codex | Priority: P1 | Due: 2026-03-03 | Dependency: 13H.1 | DoD: Call/SOS เปิด dialer ได้, Message เปิด chat stub | Deliverable: TrackingScreen | Blocker: None`

- [x] `Status: DONE` ทำ post-service flow: หลัง `completed` → ReviewSheet star rating + `POST /customer/bookings/:id/post-service`
  `Owner: Codex | Priority: P0 | Due: 2026-03-04 | Dependency: 13H.1 | DoD: submit rating ได้, UX ชัดเจน | Deliverable: TrackingScreen + ReviewSheet | Blocker: None`

---

### 13I) Bookings Screen — History & Upcoming

งาน: ประวัติการจองและ upcoming bookings

- [x] `Status: DONE` สร้าง `BookingsScreen` เรียก `GET /customer/bookings/cust_1` แสดง 2 tabs: Upcoming / History
  `Owner: Codex | Priority: P0 | Due: 2026-03-04 | Dependency: 13C | DoD: list load ได้, tab switch ได้ | Deliverable: apps/mobile/src/screens/BookingsScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ booking card แสดง: booking ID, slot time, status badge, amount
  `Owner: Codex | Priority: P0 | Due: 2026-03-05 | Dependency: 13I.1 | DoD: status ถูกต้อง | Deliverable: BookingsScreen | Blocker: None`

- [x] `Status: DONE` ทำ cancel booking: กด cancel → reason picker → `POST /customer/bookings/:id/cancel` พร้อม cancellation policy note
  `Owner: Codex | Priority: P1 | Due: 2026-03-05 | Dependency: 13I.1 | DoD: cancel สำเร็จ list refresh | Deliverable: BookingsScreen | Blocker: None`

- [x] `Status: DONE` ทำ dispute flow: กด "Dispute" บน completed booking → form เหตุผล → `POST /disputes`
  `Owner: Codex | Priority: P1 | Due: 2026-03-06 | Dependency: 13I.1 | DoD: submit ได้, confirmation แสดง | Deliverable: BookingsScreen (DisputeSheet inline) | Blocker: None`

---

### 13J) Rewards Screen

งาน: แสดง loyalty points, tier, wallet

- [x] `Status: DONE` สร้าง `RewardsScreen` แสดง: tier badge, points, animated progress bar ไปยัง tier ถัดไป
  `Owner: Codex | Priority: P1 | Due: 2026-03-06 | Dependency: 13C, 13B | DoD: render ถูกต้อง, animate progress bar | Deliverable: apps/mobile/src/screens/RewardsScreen.tsx | Blocker: None`

- [x] `Status: DONE` แสดง wallet balance stub และ saved cards placeholder
  `Owner: Codex | Priority: P1 | Due: 2026-03-07 | Dependency: 13J.1 | DoD: แสดง balance, placeholder cards | Deliverable: RewardsScreen | Blocker: None`

- [x] `Status: DONE` แสดง favourite barbers list (stub จาก mock data)
  `Owner: Codex | Priority: P2 | Due: 2026-03-07 | Dependency: 13J.1 | DoD: แสดง list | Deliverable: RewardsScreen | Blocker: None`

---

### 13K) Push Notifications

งาน: รับ push notification สำหรับ booking events

- [x] `Status: DONE` ลงทะเบียน device token ผ่าน `expo-notifications` และส่ง register ไปยัง `POST /platform/devices/register`
  `Owner: Codex | Priority: P0 | Due: 2026-03-08 | Dependency: 13C | DoD: token register สำเร็จหลัง login | Deliverable: apps/mobile/src/lib/notifications.ts | Blocker: None`

- [x] `Status: DONE` handle push notification เมื่อ app อยู่ foreground: `subscribeToForegroundNotifications` → Alert.alert พร้อมปุ่มนำทาง
  `Owner: Codex | Priority: P0 | Due: 2026-03-08 | Dependency: 13K.1 | DoD: notification แสดงถูกต้อง | Deliverable: notifications.ts | Blocker: None`

- [x] `Status: DONE` handle push notification เมื่อ app อยู่ background / killed: `subscribeToNotificationResponse` → navigate ไป Customer app
  `Owner: Codex | Priority: P0 | Due: 2026-03-09 | Dependency: 13K.1 | DoD: deep link ทำงานได้ | Deliverable: notifications.ts + App.tsx | Blocker: None`

---

### 13L) QA, Testing & Accessibility

งาน: ทดสอบความถูกต้องและ accessibility ก่อน build production

- [ ] `Status: TODO` ทดสอบ E2E flow ครบบน Expo Go: Login → Discovery → ShopDetail → Booking → Tracking → Review
  `Owner: Codex | Priority: P0 | Due: 2026-03-10 | Dependency: 13A..13K | DoD: flow ผ่านได้ไม่ crash | Deliverable: test report | Blocker: None`

- [ ] `Status: TODO` ทำ accessibility pass: minimum touch target 44px, contrast ratio ผ่าน WCAG AA, screen reader label ครบ
  `Owner: Codex | Priority: P0 | Due: 2026-03-10 | Dependency: 13A..13J | DoD: audit ผ่านทุก screen หลัก | Deliverable: accessibility audit note | Blocker: None`

- [ ] `Status: TODO` ทดสอบ offline/poor network: แสดง error state ที่เข้าใจได้ ไม่ crash
  `Owner: Codex | Priority: P1 | Due: 2026-03-11 | Dependency: 13L.1 | DoD: error banner แสดง retry ได้ | Deliverable: test report | Blocker: None`

- [ ] `Status: TODO` ทดสอบบน iOS Simulator และ Android Emulator ทั้ง 2 platform
  `Owner: Codex | Priority: P0 | Due: 2026-03-11 | Dependency: 13L.1 | DoD: ไม่มี crash, layout ถูกต้องทั้ง 2 platform | Deliverable: test screenshots | Blocker: None`

- [ ] `Status: TODO` Performance pass: FlatList ใช้ `keyExtractor` + `getItemLayout` ถูกต้อง, image มี cache header
  `Owner: Codex | Priority: P1 | Due: 2026-03-12 | Dependency: 13L.4 | DoD: scroll 60fps บน mid-range device | Deliverable: Profiler report | Blocker: None`

---

### 13M) EAS Build & Store Preparation

งาน: build production binary พร้อมขึ้น App Store / Play Store

- [x] `Status: DONE` ตั้งค่า `eas.json` build profiles: `development`, `preview`, `production` ให้ครบ
  `Owner: Codex | Priority: P0 | Due: 2026-03-13 | Dependency: 13L | DoD: build แต่ละ profile ผ่านใน EAS | Deliverable: apps/mobile/eas.json | Blocker: None`

- [ ] `Status: TODO` สร้าง App Icons ครบ resolution (iOS 1024×1024, Android adaptive icon) และ Splash Screen
  `Owner: Codex | Priority: P0 | Due: 2026-03-13 | Dependency: DEP-00 | DoD: icon แสดงถูกต้อง บน simulator/device | Deliverable: apps/mobile/assets/ | Blocker: None`

- [x] `Status: DONE` ตั้งค่า bundle identifier (`com.barbergo.app`) สำหรับ iOS และ `applicationId` สำหรับ Android ใน `app.json`
  `Owner: Codex | Priority: P0 | Due: 2026-03-13 | Dependency: DEP-00 | DoD: config ถูกต้องสำหรับ store submission | Deliverable: apps/mobile/app.json | Blocker: None`

- [ ] `Status: TODO` run `eas build --platform all --profile preview` ได้ artifact `.ipa` และ `.apk`
  `Owner: Codex | Priority: P0 | Due: 2026-03-14 | Dependency: 13M.1..13M.3 | DoD: build สำเร็จ ไม่มี error, install บน device ได้ | Deliverable: EAS build link | Blocker: None`

- [ ] `Status: TODO` เตรียม App Store Connect metadata: app name, description, screenshots (6.5", 5.5"), keywords, age rating
  `Owner: Codex | Priority: P1 | Due: 2026-03-15 | Dependency: 13M.4 | DoD: metadata ครบ submit review ได้ | Deliverable: store listing draft | Blocker: None`

- [ ] `Status: TODO` เตรียม Google Play Console metadata: store listing, content rating, target API level 35+
  `Owner: Codex | Priority: P1 | Due: 2026-03-15 | Dependency: 13M.4 | DoD: metadata ครบ submit review ได้ | Deliverable: store listing draft | Blocker: None`

- [ ] `Status: TODO` Sign-off Phase 13 Mobile App (Product + Engineering + QA)
  `Owner: Codex | Priority: P0 | Due: 2026-03-17 | Dependency: งาน 13A..13M ครบ | DoD: Sign-off | Deliverable: acceptance note | Blocker: None`

---

## Phase 14 - Partner Mobile App (React Native + Expo)

อัปเดต: 2026-02-18
เป้าหมาย: สร้าง Partner Mobile App ใน binary เดียวกับ Customer (`apps/mobile`) ให้ partner จัดการร้าน รับงาน และรับเงินได้ครบ end-to-end

หมายเหตุ: Phase 13 (Customer) และ Phase 14 (Partner) แชร์ dependencies ร่วมกัน (13A–13C) — ถ้า 13A–13C เสร็จแล้วให้ข้ามส่วน setup ซ้ำ

Default for Phase 14:
- `Owner: Codex | Priority: P1 | Sprint: S14 | Dependency: Phase 13A/13B/13C | DoD: Implementation | Deliverable: working screen + passing build | Blocker: Phase 13A complete`

---

### 14A) Partner Navigation & Auth

งาน: แยก navigation flow สำหรับ Partner role หลัง login

- [x] `Status: DONE` เพิ่ม Partner Bottom Tab Navigator: Dashboard / Jobs / Services / Schedule / Wallet
  `Owner: Codex | Priority: P0 | Due: 2026-03-18 | Dependency: 13C | DoD: navigate ได้ครบ 5 tabs | Deliverable: apps/mobile/src/navigation/PartnerNavigator.tsx | Blocker: None`

- [x] `Status: DONE` ทำ role-based routing: หลัง login ถ้า role=`partner` → PartnerNavigator, ถ้า role=`customer` → CustomerNavigator
  `Owner: Codex | Priority: P0 | Due: 2026-03-18 | Dependency: 14A.1 | DoD: redirect ถูก role, ไม่ข้ามกัน | Deliverable: apps/mobile/src/navigation/RootNavigator.tsx | Blocker: None`

- [x] `Status: DONE` สร้าง Partner auth store (Zustand): เก็บ `partnerId`, `shopId`, `isOnline` status พร้อม toggle online/offline
  `Owner: Codex | Priority: P0 | Due: 2026-03-18 | Dependency: 13C | DoD: toggle online ได้ persist ข้าม session | Deliverable: apps/mobile/src/store/partnerStore.ts | Blocker: None`

---

### 14B) Partner Dashboard Screen

งาน: หน้าหลัก partner — KPI metrics, online toggle, KYC status, live alerts

- [x] `Status: DONE` สร้าง `PartnerDashboardScreen` แสดง: online/offline toggle, Today's Revenue, Completed Jobs, Rating, Completion Rate
  `Owner: Codex | Priority: P0 | Due: 2026-03-19 | Dependency: 14A | DoD: ข้อมูล load จาก API, toggle ได้ | Deliverable: apps/mobile/src/screens/partner/DashboardScreen.tsx | Blocker: None`

- [x] `Status: DONE` แสดง KYC verification banner ถ้า `verification_status !== approved` พร้อม CTA "Complete KYC"
  `Owner: Codex | Priority: P0 | Due: 2026-03-19 | Dependency: 14B.1 | DoD: banner แสดง/ซ่อนตาม status, กด CTA ไป KYC flow | Deliverable: DashboardScreen | Blocker: None`

- [x] `Status: DONE` แสดง incoming job alert badge บน Jobs tab เมื่อมี new booking request
  `Owner: Codex | Priority: P1 | Due: 2026-03-20 | Dependency: 14B.1, 14C | DoD: badge count ถูกต้อง, update real-time | Deliverable: PartnerNavigator badge | Blocker: None`

---

### 14C) Jobs Screen — Booking Queue & Operations

งาน: รับและจัดการ booking จาก customer

- [x] `Status: DONE` สร้าง `JobsScreen` เรียก `GET /partner/bookings/incoming/:partnerId` แสดง queue พร้อม: customer name, service, slot, price
  `Owner: Codex | Priority: P0 | Due: 2026-03-20 | Dependency: 14A | DoD: queue load ได้, pull-to-refresh ได้ | Deliverable: apps/mobile/src/screens/partner/JobsScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ job action buttons: Confirm / Reject / Start / Complete ตาม booking state machine
  `Owner: Codex | Priority: P0 | Due: 2026-03-21 | Dependency: 14C.1 | DoD: transition ถูก state, error toast ถ้า fail | Deliverable: JobsScreen + JobCard.tsx | Blocker: None`

- [x] `Status: DONE` ทำ countdown timer บน active job (in_progress) แสดงเวลาที่เหลือ
  `Owner: Codex | Priority: P1 | Due: 2026-03-21 | Dependency: 14C.2 | DoD: timer นับถอยหลัง, หยุดเมื่อ complete | Deliverable: JobCard.tsx | Blocker: None`

- [x] `Status: DONE` รับ push notification เมื่อมี booking request ใหม่ → กด notification นำทางไป JobsScreen
  `Owner: Codex | Priority: P0 | Due: 2026-03-22 | Dependency: 13K, 14C.1 | DoD: notification มาถึง, tap → navigate ได้ | Deliverable: notifications.ts (partner handler) | Blocker: None`

- [x] `Status: DONE` ทำ no-show flow: กดรายงาน no-show บน confirmed booking ที่ลูกค้าไม่มา
  `Owner: Codex | Priority: P1 | Due: 2026-03-22 | Dependency: 14C.2 | DoD: no-show บันทึกได้, policy fee แสดง | Deliverable: JobsScreen | Blocker: None`

---

### 14D) Services & Staff Management Screen

งาน: จัดการบริการ พนักงาน และสาขา

- [x] `Status: DONE` สร้าง `ServicesScreen` แสดง service list: ชื่อ, ราคา, duration, mode (in-shop/delivery) พร้อม toggle active/inactive
  `Owner: Codex | Priority: P0 | Due: 2026-03-23 | Dependency: 14A | DoD: list load ได้, toggle ได้ | Deliverable: apps/mobile/src/screens/partner/ServicesScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ Add/Edit service form (bottom sheet): ชื่อ, ราคา, duration, mode — submit ไป `POST /partner/services`
  `Owner: Codex | Priority: P0 | Due: 2026-03-24 | Dependency: 14D.1 | DoD: save สำเร็จ list refresh | Deliverable: ServiceFormSheet.tsx | Blocker: None`

- [x] `Status: DONE` แสดง staff list พร้อม: ชื่อ, skills, สถานะ online/offline และ Add staff form
  `Owner: Codex | Priority: P1 | Due: 2026-03-24 | Dependency: 14A | DoD: list load ได้, add staff ได้ | Deliverable: ServicesScreen (Staff tab) | Blocker: None`

- [ ] `Status: TODO` แสดง branch list และ branch capacity/hours (read-only MVP — edit ใน phase ถัดไป)
  `Owner: Codex | Priority: P2 | Due: 2026-03-25 | Dependency: 14D.1 | DoD: แสดงข้อมูลสาขาได้ | Deliverable: ServicesScreen (Branch tab) | Blocker: None`

---

### 14E) Schedule Screen

งาน: จัดการตารางเปิด-ปิดของสาขาและพนักงาน

- [x] `Status: DONE` สร้าง `ScheduleScreen` แสดง 7-day schedule grid พร้อม open/close toggle รายวัน
  `Owner: Codex | Priority: P1 | Due: 2026-03-25 | Dependency: 14A | DoD: toggle วันได้, save ได้ | Deliverable: apps/mobile/src/screens/partner/ScheduleScreen.tsx | Blocker: None`

- [x] `Status: DONE` แสดง upcoming bookings timeline รายวัน (slot ที่จองแล้ว) เพื่อให้เห็น capacity
  `Owner: Codex | Priority: P1 | Due: 2026-03-26 | Dependency: 14E.1 | DoD: แสดง slot ที่จองใน calendar view | Deliverable: ScheduleScreen | Blocker: None`

---

### 14F) Wallet & Revenue Screen

งาน: รายได้ การถอนเงิน และ transaction history

- [x] `Status: DONE` สร้าง `WalletScreen` เรียก `GET /partner/wallet/:partnerId` แสดง: available balance, pending balance, total earned
  `Owner: Codex | Priority: P0 | Due: 2026-03-26 | Dependency: 14A | DoD: balance ถูกต้อง, load ได้ | Deliverable: apps/mobile/src/screens/partner/WalletScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ withdrawal flow: กรอก amount → confirm → `POST /partner/wallet/:partnerId/withdraw` พร้อม validation (ไม่เกิน available)
  `Owner: Codex | Priority: P0 | Due: 2026-03-27 | Dependency: 14F.1 | DoD: withdraw สำเร็จ balance update, error แสดง toast | Deliverable: WalletScreen + WithdrawSheet.tsx | Blocker: None`

- [x] `Status: DONE` แสดง transaction history: job id, service name, gross amount, commission fee, net payout รายการย้อนหลัง
  `Owner: Codex | Priority: P1 | Due: 2026-03-27 | Dependency: 14F.1 | DoD: list แสดงครบ, scroll ได้ | Deliverable: WalletScreen | Blocker: None`

---

### 14G) Partner Onboarding & KYC Flow

งาน: flow สมัครเป็น partner และส่งเอกสาร KYC

- [x] `Status: DONE` สร้าง `OnboardingScreen` flow แบบ step-by-step: ข้อมูลร้าน → เอกสาร → bank account → submit
  `Owner: Codex | Priority: P0 | Due: 2026-03-28 | Dependency: 14A | DoD: submit ได้ครบ, status แสดง pending | Deliverable: apps/mobile/src/screens/partner/OnboardingScreen.tsx | Blocker: None`

- [x] `Status: DONE` ทำ document upload: ถ่ายรูป/เลือกจาก gallery ด้วย `expo-image-picker` แล้ว upload ไป MinIO
  `Owner: Codex | Priority: P0 | Due: 2026-03-28 | Dependency: 14G.1 | DoD: upload สำเร็จ, preview รูปได้ | Deliverable: OnboardingScreen | Blocker: None`

- [x] `Status: DONE` แสดง KYC status screen: pending/approved/rejected พร้อม reason ถ้า rejected และ re-submit ได้
  `Owner: Codex | Priority: P0 | Due: 2026-03-29 | Dependency: 14G.1 | DoD: status แสดงถูกต้องตาม API | Deliverable: OnboardingScreen | Blocker: None`

---

### 14H) QA, Testing & Sign-off

งาน: ทดสอบ Partner flows ครบก่อน build production

- [ ] `Status: TODO` ทดสอบ E2E Partner flow: Login → Dashboard → รับงาน → Confirm → Start → Complete → Wallet withdraw
  `Owner: Codex | Priority: P0 | Due: 2026-03-30 | Dependency: 14A..14G | DoD: flow ผ่านไม่ crash ทั้ง iOS และ Android | Deliverable: test report | Blocker: None`

- [ ] `Status: TODO` ทดสอบ push notification สำหรับ Partner: incoming booking, booking cancelled by customer
  `Owner: Codex | Priority: P0 | Due: 2026-03-30 | Dependency: 13K, 14C.4 | DoD: notification มาถึงและ navigate ถูก screen | Deliverable: test report | Blocker: None`

- [ ] `Status: TODO` ทำ accessibility pass: touch target 44px, contrast, screen reader label ครบทุก Partner screen
  `Owner: Codex | Priority: P0 | Due: 2026-03-31 | Dependency: 14A..14G | DoD: audit ผ่าน | Deliverable: accessibility note | Blocker: None`

- [ ] `Status: TODO` run `eas build --platform all --profile preview` รวม Customer + Partner ใน binary เดียว
  `Owner: Codex | Priority: P0 | Due: 2026-04-01 | Dependency: 13M, 14A..14G | DoD: build สำเร็จ install ได้ | Deliverable: EAS build link | Blocker: None`

- [ ] `Status: TODO` Sign-off Phase 14 Partner Mobile App (Product + Engineering + QA + Ops)
  `Owner: Codex | Priority: P0 | Due: 2026-04-02 | Dependency: งาน 14A..14H ครบ | DoD: Sign-off | Deliverable: acceptance note | Blocker: None`
