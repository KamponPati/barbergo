# On-Call and Escalation Matrix

## On-Call Rotation
- Primary: Backend engineer (24x7 by weekly rotation)
- Secondary: Platform engineer
- Tertiary: Engineering manager

## Escalation SLA
- P1: acknowledge within 5 minutes, engage incident commander immediately
- P2: acknowledge within 15 minutes
- P3: acknowledge within 4 hours

## Escalation Chain
1. Primary on-call
2. Secondary on-call
3. Engineering manager
4. Product owner + Support lead

## Incident Channels
- War room: `#incident-barbergo`
- Status updates: every 15 minutes for P1

## Paging Rules
- Pager trigger on:
  - API error rate breach
  - checkout failure spike
  - auth/login failure spike
