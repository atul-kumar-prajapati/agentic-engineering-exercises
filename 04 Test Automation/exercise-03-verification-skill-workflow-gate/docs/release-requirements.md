# Workflow Release Requirements

- The client must reject workflow payloads with no `decisionState` instead of silently accepting them.
- Every API workflow response must include `decisionState`.
- `Blocked` items use `needs-evidence`; an accepted `Ready` decision uses `accepted`.
- Allowed decision transitions are `Blocked` and `Ready`. Any other state must be rejected.
- The release gate must run the client tests and build plus the complete provider tests and build.
- A completion claim must name the exact fresh command, exit code, and relevant output.
