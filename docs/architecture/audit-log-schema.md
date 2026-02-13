# Audit Log Schema v1

Version: 1.0-frozen
Date: 2026-02-12

## Purpose

Track privileged actions for governance, compliance, and incident forensics.

## Table: audit_logs

1. `id` (PK)
2. `action` (string)
3. `actor_user_id` (nullable string)
4. `request_id` (nullable string)
5. `path` (string)
6. `method` (string)
7. `metadata_json` (nullable json)
8. `created_at` (timestamp)

## Privileged Actions (v1)

1. Admin API access (`/api/v1/admin/*`)
2. Role-protected auth operations (`/api/v1/auth/admin-only`)
3. Policy/dispute actions (extend in later phases)

## Query Baseline

1. By request trace: `request_id`
2. By actor: `actor_user_id`
3. By time range: `created_at`
