# Model Routing Evidence

Use full Git SHAs, exact provider settings, response hashes, token counts, latency, pricing, and command exit codes.

## `evidence/before.md` and `evidence/after.md`

Record these fields exactly:

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Patch SHA-256:

Also record the pack digest, three-run condition, total expected cost, total expected latency, quality failures, safety failures, and clarification count.

Use `evidence/before.patch` for the all-reasoning router and `evidence/after.patch` for the field-based router.

## `evidence/comparison.md`

Compare selected routes, quality floors, safety failures, retries, escalations, expected cost, latency, variance, and savings percentage. State the adoption decision from the generated scorecard.

Include `Same conditions`, `Before`, `After`, `Proof`, and `Conclusion`. Generate `after.patch` with `git diff --binary --full-index <starting-commit> <implementation-commit>`.
