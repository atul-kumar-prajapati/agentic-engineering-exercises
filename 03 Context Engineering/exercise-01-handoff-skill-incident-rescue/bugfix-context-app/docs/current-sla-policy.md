# Customer Escalation SLA Policy

Status: Approved
Version: 3.1
Effective: 2026-07-01
Owner: Support Operations

This is the authoritative policy for automatic customer escalation.

## Automatic escalation

A case is automatically escalated only when all of the following are true:

- Priority is `High`.
- Waiting time is 48 hours or greater.
- The case is not already escalated.
- The case was not manually escalated.

Automatic escalation changes only:

- `status` to `Escalated`.
- `escalationMode` to `automatic`.

The existing owner, note, identity, priority, waiting time, score, due date, and tags must be preserved.

## Existing escalations

Manual escalations must remain unchanged. Re-running the automatic escalation process must be idempotent and must not rewrite existing automatic escalations.

## State and totals

The automatic escalation process must save the resulting queue state. A later fetch and the dashboard totals must use that same state.
