# Rollback Evidence Template

The supplied drill creates both rollback evidence files. Review them before submission.

`rollback-drill.json` must record the source SHA, command, actor, reason, timestamp, start time, end time, elapsed milliseconds, configuration digests, configuration before and after, and observed behavior before and after.

`rollback-drill.md` must clearly state:

- Source SHA and exact rollback command.
- Before: flag enabled, preview selected, one API call, one telemetry event.
- After: flag disabled, allowlist empty, legacy selected, zero API calls, zero telemetry events.
- Previous and rollback revisions.
- Start time, end time, elapsed milliseconds, result, and remaining cleanup.
- A passing invalid-input check proving the configuration was not changed.
