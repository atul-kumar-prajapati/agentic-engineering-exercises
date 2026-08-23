# Session Adapter Refactor Request

Refactor `src/session/adaptSession.mjs` so validation and role normalization are easier to maintain. Preserve the exact public contract in `current-adapter-contract.md`.

Acceptance checks cover valid sessions, unknown fields, first-occurrence role deduplication, empty roles, missing user identity, invalid roles, invalid expiry, synchronous errors, and unchanged serialized output. Do not change callers or add a dependency.
