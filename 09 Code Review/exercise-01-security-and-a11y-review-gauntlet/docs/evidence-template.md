# Security and Accessibility Review Evidence

Use full Git SHAs, exact commands, exit codes, source locations, and test names. Do not copy scanner output as a finding without reproducing its behavior.

## `evidence/before.md` and `evidence/after.md`

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch` or `evidence/after.patch`
- Patch SHA-256:

Record baseline command exit codes and counts for true positives, false positives, manual blockers, and missing regression tests.
In `after.md`, also record `npm run test:review`, `npm run test:regression-proof`, `npm run review:verify`, and `npm run agent:check` exit codes.

## `evidence/comparison.md`

Compare true positives, false positives, manual findings, trusted-boundary coverage, tests, and command results. Link every change to a finding ID and code anchor. Include `Same conditions`, `Before`, `After`, `Proof`, and `Conclusion`.
