# Exercise 02 : Independent Diff Triage

## Your Mission

Your team needs an independent review of a caching PR, but the implementer's assumptions and a plausible reviewer claim can bias the result. Your mission is to review the exact diff in a fresh session, prove or dismiss every finding, and fix only confirmed blockers.

Keep implementation context out of the reviewer session and make the final triage reproducible.

The duration for this challenge is 60 min or less.

## Project

[fresh-review-app](./fresh-review-app) contains the risky head state. `fixtures/review-target.bundle` and `fixtures/manifest.json` define the exact protected `review-base..review-head` range.

## How To Go About It

1. Verify the bundle and record the exact base and head SHAs, baseline checks, and protected diff in `evidence/before.md` and `evidence/before.patch`.

2. Start a fresh agent session with only the protected diff, manifest, and [review brief](./docs/review-brief.md). Do not provide implementation chat, implementer notes, expected finding IDs, or an earlier review.

3. Preserve the exact prompt and session metadata. Reproduce every finding against the mounted head before assigning severity or recommending a fix.

4. Explicitly evaluate the claim in [reviewer noise](./docs/reviewer-noise.md). Accept or dismiss it only after a focused reproduction.

5. Fix only supported blockers with the smallest change and add focused cache regression tests under `tests/`. Avoid unrelated refactoring.

6. Add learner regression tests for every confirmed blocker. The protected replay mounts the same tests on the risky head and the remediation; they must fail before and pass after.

7. Commit the focused fixes and tests first. Run a fresh recheck of that exact commit, then add reviewer session data, review reports, patches, command proof, and comparison in an evidence-only commit.

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
- Every confirmed blocker is reproduced, fixed, and covered by a focused test.
- The supplied reviewer claim is accepted or dismissed with direct code and reproduction evidence.
- The same learner regression tests fail on the protected head and pass after remediation.
- The remediation commit contains only focused fixes and learner tests.
- `npm run verify:exercise` passes and every finding, dismissal, change, and check is traceable.
