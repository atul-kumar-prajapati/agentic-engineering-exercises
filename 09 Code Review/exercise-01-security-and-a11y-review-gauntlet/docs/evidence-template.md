# Security and Accessibility Review Evidence

Use full Git SHAs, exact commands, exit codes, source locations, and test names. Do not copy scanner output as a finding without reproducing its behavior.

## `evidence/before.md`

- Review base SHA:
- Review head SHA:
- Reviewer agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Patch: `evidence/before.patch`

Record baseline command exit codes and counts for true positives, false positives, manual blockers, and missing regression tests.

## `evidence/after.md`

- Remediation commit:
- Recheck agent and model:
- Tools and permissions:
- Patch: `evidence/after.patch`

Record `npm run test:review`, `npm run review:verify`, and `npm run agent:check` exit codes, fixed finding IDs, dismissed IDs, regression tests added, files changed, and lines added and removed.

## `evidence/comparison.md`

Compare true positives, false positives, manual findings, server-boundary coverage, tests, and command results. Link every change to a finding ID and exact file and line.
