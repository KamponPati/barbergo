# BarberGo Project Task Board

อัปเดตล่าสุด: 2026-02-16
สถานะล่าสุด: Phase 0-9 Signed แล้ว (Phase 9 Closed: 2026-02-16)

ลำดับงานถัดไป (แนะนำ):
- Phase 5: Data + Domain (ทำให้ระบบ “ใช้ DB จริง” แทน in-memory)
- Phase 6: Infrastructure + Environments + Recovery (staging/prod parity, backup/restore, observability, reverse proxy)
- Phase 7: UI/UX Hi-Fi (Single Theme) (ทำหน้าจอจริงให้พร้อมใช้งาน/เข้าถึงได้)
- Phase 8: Mobile Apps + Store Release (ถ้าต้องการ iOS/Android)
- Phase 9: Marketing + Brand + Legal + Support Content

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

---

## Cross-Phase Governance (ทำต่อเนื่องทุก Phase)

Default for Cross-Phase:
- `Owner: Codex | Priority: P0 | Sprint: ทุก sprint | Due: recurring (weekly/monthly) | Dependency: DEP-00 | DoD: อัปเดตรายงานตาม cadence ครบ | Deliverable: risk/dependency/security/KPI review logs | Blocker: None`

- [ ] `Status: TODO` อัปเดต risk register รายสัปดาห์
- [ ] `Status: TODO` อัปเดต dependency log (ทีมภายใน/ผู้ให้บริการภายนอก)
- [ ] `Status: TODO` ทบทวน security/compliance checklist ราย sprint
- [ ] `Status: TODO` ทบทวน data retention/deletion workflow ตาม policy
- [ ] `Status: TODO` ทบทวน KPI/North Star dashboard correctness
- [ ] `Status: TODO` ทบทวน kill criteria และ pivot triggers รายเดือน

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
