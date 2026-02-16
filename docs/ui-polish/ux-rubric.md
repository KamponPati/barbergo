# UX Quality Rubric (Phase 10A)

Last updated: 2026-02-16
Owner: Codex

## Scoring Model

- Score scale per dimension:
  - `1` = poor (blocks task completion)
  - `2` = weak (high friction)
  - `3` = acceptable (usable with noticeable friction)
  - `4` = good (smooth and clear)
  - `5` = excellent (high confidence, low friction)
- Overall score:
  - average of 6 dimensions
- Pass threshold for phase sign-off:
  - no dimension below `3`
  - overall average `>= 4.0` on critical journeys

## Dimensions

1. Clarity
- Is the primary task obvious in first 5 seconds?
- Are labels and statuses understandable for non-technical users?

2. Consistency
- Are patterns repeated predictably across pages and roles?
- Are spacing, hierarchy, and component states uniform?

3. Affordance
- Are primary vs secondary actions visually distinct?
- Is destructive or high-risk action clearly indicated?

4. Feedback
- Does every action provide immediate status/loading/success/error response?
- Are retries/recovery steps clearly suggested?

5. Accessibility
- Keyboard usability, focus visibility, semantic structure, contrast.
- Screen-reader compatibility for key workflows.

6. Responsiveness
- Layout and interaction quality across target breakpoints/devices.
- No clipping, overlap, or action-loss under common viewport sizes.

## Evaluation Template

Use table per journey:

| Journey | Clarity | Consistency | Affordance | Feedback | Accessibility | Responsiveness | Average | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Customer checkout | - | - | - | - | - | - | - | - |
| Partner booking ops | - | - | - | - | - | - | - | - |
| Admin analytics | - | - | - | - | - | - | - | - |
| Marketing conversion | - | - | - | - | - | - | - | - |

## Gate for 10B Entry

- Inventory completed
- Rubric accepted
- Baseline metrics recorded (10A.3)
