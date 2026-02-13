# Release Strategy (Canary + Blue/Green)

## Strategy
- Default rollout: canary
- Fallback strategy: blue/green switchback

## Canary Steps
1. Deploy to canary slice (5% traffic).
2. Monitor 10-15 minutes:
   - error rate
   - p95 latency
   - checkout success rate
3. Increase to 25%, then 50%, then 100% if guardrails pass.

## Automated Rollback Gates
- Roll back automatically if:
  - error rate > 1% for 5 minutes
  - p95 > 800ms for critical APIs
  - critical smoke journey fails

## Blue/Green Switchback
- Keep previous stable environment active.
- If canary fails, switch router/load balancer to previous stable.
- Run post-switch smoke checks.

## Ownership
- Release manager: executes and approves stage promotions.
- Incident commander: leads rollback decision if gates fail.
