# Remediation Contract

The remediation must provide these observable outcomes:

- Render request notes as text. Rich HTML formatting is not required.
- Use native buttons for queue selection and expose the selected state with `aria-pressed`.
- Calculate portfolio risk in one pass and memoize it while the review collection is unchanged.
- `approveAccessReview` receives an explicit actor and optional injected `wait` dependency.
- Reject privileged approval with `NOT_AUTHORIZED` when the actor lacks permission.
- Reject privileged approval with `MISSING_EVIDENCE` when evidence is incomplete.
- Return structured `ApprovalError` failures and allow deterministic tests without `window` or real timers.

Keep the remediation commit limited to `nfr-swarm-app/src/**` and optional participant tests under `nfr-swarm-app/tests/**`. Commit evidence afterward.
