# Integration Decision Log

| Finding ID | Decision | Owner | Rationale | Verification evidence | Residual risk |
|---|---|---|---|---|---|

Use `fix`, `defer`, or `dismiss`. Every baseline finding and supplied `CLAIM-01` must appear once. Required blocker IDs must be fixed. A deferred or dismissed finding needs concrete source or command evidence and residual risk.

In `decision-log.json`, add one `interactions` entry for `SEC-02` and `TEST-01`. Record their shared path, how one boundary change satisfies both findings, both verification commands, and remaining risk.

Record the baseline SHA, remediation SHA, merge decision, rollback command, changed paths, final checks, and remaining risk in `evidence/integration.md`.
