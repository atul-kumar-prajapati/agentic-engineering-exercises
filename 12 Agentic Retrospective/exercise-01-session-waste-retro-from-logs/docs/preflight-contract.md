# Retry Preflight Contract

Export `evaluateCommandAttempt({ command, workspaceRevision, events })` from `src/retro/preflightPolicy.mjs`.

Return `{ allowed: false, reason: "DIAGNOSIS_OR_CHANGE_REQUIRED" }` when the latest identical command at the same revision failed and no later diagnosis exists. Return `{ allowed: true, reason: "FIRST_OR_INFORMED_ATTEMPT" }` for a first attempt, a different command, a new revision, or an attempt after diagnosis.

The preflight is evaluated before a command executes. It must not rewrite trace events.
