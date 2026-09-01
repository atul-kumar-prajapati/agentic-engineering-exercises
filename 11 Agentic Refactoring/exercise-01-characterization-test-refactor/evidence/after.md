# After Attempt — Characterization-First Refactor (Exercise 11.1)

The characterization-first run: a fresh agent session, matched to the unconstrained run on agent, model, tools, permissions, request, and time limit, whose only extra input was the exercise's own characterization-first contract — the committed safety net and the workflow that uses it.

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `550e1a2e4f5254375fe6360771ad260d9c4d34c2`
- Agent and model: opencode general task subagent on opencode-go/glm-5.3
- Tools and permissions: file read/write and bash (git, node, npm); no network; dedicated isolated Git worktree
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch SHA-256: `43403942b37d412ca5ecad2bed5a4697f39f6a256969a724f2d07335da85ce8a`
- Patch path: evidence/after.patch
- Oracle exit code: 0
- Output SHA-256: `5ce2adedc6dcb063b8ba99dbb1a2bbd49755e3e92437548b806dcea56aa98bab`
- Changed cases: 0 of 10 golden observations changed
- Changed files: legacyEligibility.mjs only in the refactor commit (+33/−21); the cumulative after.patch additionally carries the characterization test (+38) and before-output.json (+142) from the preceding characterization commit — 3 files, +213/−21
- Lines added and removed: 33 added and 21 removed in the refactor commit; 213 added and 21 removed across the 3-file cumulative patch

## What the run received, and what it did not

The after run received the team's request (identical text to the unconstrained run) plus the repo's own characterization-first contract as its only extra input: the committed `src/rules/legacyEligibility.characterization.test.mjs`, the committed `evidence/before-output.json` baseline, and the workflow instruction to keep both green and byte-identical while refactoring only `legacyEligibility.mjs` in a single-file commit.

It did not receive the before implementation, `evidence/before.patch`, or any explanation of the first attempt. The before branch lived in a separate worktree it never saw, and the before attempt had not been reviewed when this session started.

## What the agent did (its own report, verified by me)

It confirmed the safety net was green before editing, refactored the nested mutable-accumulator conditionals into an ordered decision table (`RENEWAL_DECISIONS`, first-match-wins, `plan-not-supported` fallback returning a fresh object per call), preserved the export signature, result-field key order, exact reason strings, strict `=== true` override check, `>= 12` / `>= 6` boundaries, `latePayments < 2` enterprise tolerance (negative counts still pass), and `latePayments === 0` pro strictness, then re-ran the net and the byte-identity diff before committing.

## Verification of the attempt (integration owner, re-derived)

- `git diff-tree --no-commit-id --name-only -r 550e1a2` — exactly one file, `legacyEligibility.mjs` (the `refactorSha` single-file rule).
- Parent is `characterizationSha` `af05bfa` — the safety net precedes the production edit in history.
- `node ./src/rules/legacyEligibility.characterization.test.mjs` — exit code: 0.
- `node ./scripts/run-characterization-oracle.mjs --json` diffed against `../evidence/before-output.json` — byte-identical, exit code: 0.
- My independent parity sweep (49,392 stable-property input variations) — zero divergences from the starting implementation.
- Known limitation, found by the behavior-parity review lane and re-derived by me: the decision table re-reads `tier` (up to 3×) and `monthsActive` (up to 2×) where the original's else-if cascade reads each property at most once per branch, so stateful-accessor inputs (per-read-varying getters, read-once Proxies) diverge from the original — see `evidence/commands/stateful-accessor-parity.txt`. This class lies beyond the protected golden observations, no gate covers it, and the module was deliberately left untouched to preserve first-attempt conditions; the finding is deferred as a follow-up in `evidence/integration.md`.
