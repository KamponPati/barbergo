# Phase 1 Git Workflow and Hooks Baseline

## Branching Convention

1. `main` is protected branch.
2. Feature branch format: `feature/<scope>-<short-name>`
3. Fix branch format: `fix/<scope>-<short-name>`
4. Chore branch format: `chore/<scope>-<short-name>`

## Commit Convention

1. `feat: ...`
2. `fix: ...`
3. `chore: ...`
4. `docs: ...`
5. `refactor: ...`
6. `test: ...`

## Pre-commit Hook

Hook file: `.githooks/pre-commit`

What it runs:

1. `pnpm lint`
2. `pnpm test`

Enable in local repo:

```bash
git config core.hooksPath .githooks
```
