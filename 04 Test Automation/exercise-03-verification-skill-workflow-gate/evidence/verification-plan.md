# Verification Plan

- Date: 2026-08-14
- Single release command from `workflow-gate-app`: `node scripts/verification-gate.mjs`
- Evidence artifact: `evidence/final-verification.txt`
- Result: Verification coverage defined; execution result recorded in `evidence/final-verification.txt`.

The command executes the integrity-protected release gate and covers these stages:

1. **Client release tests** run the protected response-boundary contract. A complete payload is accepted and a payload without `decisionState` is rejected.
2. **Client quality and build** run protected-input integrity, lint, the client agent check, formatting, type checking, and the Vite production build.
3. **Provider tests and build** use the committed Maven wrapper to compile production and test code and run the complete provider test suite, including the protected release tests and the added HTTP boundary tests.
4. The HTTP boundary verifies that list responses include `needs-evidence`, an accepted Ready transition returns `accepted`, and an unknown transition returns HTTP 400.

Each child command inherits its output. A nonzero child exit code is returned immediately, so failure stops the gate and later stages cannot produce a successful release claim. The completion claim will cite only the fresh command output and exit code recorded in `evidence/final-verification.txt`.
