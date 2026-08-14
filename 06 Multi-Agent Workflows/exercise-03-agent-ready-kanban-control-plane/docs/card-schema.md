# Agent-Ready Card Contract

Every card requires:

- `id`, `title`, `state`, and complete `stateHistory`.
- Reproducible `evidence`, one `owner`, and one `reviewer`.
- `requestedPaths`, active `reservedPaths`, `blockedBy`, and a `collisionRule`.
- One focused `verificationCommand`, acceptance criteria, merge criteria, dependencies, merge order, and rollback.
- A cancellation reason when state is `cancelled`.

Valid states are `incoming`, `needs-info`, `triaged`, `ready-for-agent`, `ready-for-human`, `blocked`, `in-progress`, `in-review`, `merged`, `failed`, `rejected`, and `cancelled`.

Only `ready-for-agent`, `in-progress`, or `in-review` cards may reserve paths. A path has one active owner. Merged, rejected, failed, and cancelled cards retain history but release reservations.

Allowed progressions are incoming to triage; triaged to a ready, blocked, needs-info, or cancelled state; ready-for-agent to in-progress or blocked; in-progress to in-review or failed; and in-review to merged, rejected, or in-progress. Terminal states do not reopen.
