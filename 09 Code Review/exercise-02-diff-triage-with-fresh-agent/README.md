# Exercise 02 : Independent Diff Triage

## Your Mission

Your team needs an independent review of a caching PR, but the implementer's assumptions and a plausible reviewer claim can bias the result. Your mission is to review the exact diff in a fresh session, prove or dismiss every finding, and fix only confirmed blockers.

The PR can lose saved work, fail on damaged browser data, mutate shared fixtures, and write stale state during a read-only action. One seeded claim sounds credible but is wrong.

Keep implementation context out of the reviewer session and make the final triage reproducible.

The duration for this challenge is 45 min or less.

## Project

[fresh-review-app](./fresh-review-app) contains the risky head state. `fixtures/review-target.bundle` and `fixtures/manifest.json` define the exact protected `review-base..review-head` range.

## How To Go About It

1. Verify the bundle and record the exact base and head SHAs, baseline checks, and protected diff in `evidence/before.md` and `evidence/before.patch`.

2. Start a fresh agent session with only the protected diff, manifest, and [review brief](./docs/review-brief.md). Do not provide implementation chat, implementer notes, expected finding IDs, or an earlier review.

3. Preserve the exact prompt and session metadata. Reproduce every finding against the mounted head before assigning severity or recommending a fix.

4. Explicitly evaluate the claim in [reviewer noise](./docs/reviewer-noise.md). Dismiss it if the code evidence does not support it, even if it resembles a real nearby bug.

5. Fix only supported blockers with the smallest change and add focused cache regression tests under `tests/`. Avoid unrelated refactoring.

6. Run a fresh recheck of the remediation commit and verify malformed cache recovery, immutable defaults, save persistence, read-only evidence collection, and filter changes.

7. Save `evidence/after.md`, `evidence/after.patch`, reviewer session data, review reports, command proof, and comparison. Raise the focused PR.

## Evidence

Submit:

- The fixed application and learner cache regression tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Reviewer session metadata, the exact fresh prompt, `review.json`, and `review.md`.
- Protected fixture output, focused test output, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, fresh-session boundaries, exact review range, application quality, four cache fixes, false-claim dismissal, regression tests, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- The fresh reviewer receives no implementation context, expected findings, or earlier review.
- Four cache blockers are reproduced, fixed, and covered by focused tests.
- The claim that `saveAction` mutates the shared fixture is dismissed with exact code evidence.
- The remediation commit contains only focused fixes and learner tests.
- `npm run verify:exercise` passes and every finding, dismissal, change, and check is traceable.
