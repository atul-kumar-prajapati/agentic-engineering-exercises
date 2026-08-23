# Exercise 01 : Security and Accessibility Review Gauntlet

## Your Mission

Your team is about to merge a PR that mixes real regressions with a believable scanner false positive. Your mission is to review the exact diff, separate signal from noise, and fix every confirmed blocker at the correct boundary.

Produce a review whose findings, dismissals, fixes, and regression tests can all be reproduced.

The duration for this challenge is 60 min or less.

## Project

[review-gauntlet-app](./review-gauntlet-app) contains the vulnerable head state. `fixtures/review-target.bundle` and `fixtures/manifest.json` define the exact protected `review-base..review-head` range.

## How To Go About It

1. Verify and clone the protected bundle. Record the exact base and head SHAs, initial check results, and vulnerable patch in `evidence/before.md` and `evidence/before.patch`.

2. Install the tested Semgrep version with `python -m pip install --requirement review-gauntlet-app/requirements-semgrep.txt`, then run `npm run review:semgrep` from the app directory. The protected runner scans the bundled vulnerable head and writes `evidence/semgrep.json`; reproduce every warning before deciding whether it is a blocker.

3. Review security, accessibility, validation, and trusted server boundaries. Do not treat scanner output as the complete review.

4. Record every supported finding using the [finding contract](./docs/finding-contract.md). Use a code anchor from the protected diff instead of a fragile exact line number. A dismissal needs direct reproduction evidence.

5. Fix confirmed blockers at the smallest correct boundary. Do not remove the safe static scanner finding merely to silence the tool.

6. Add focused regression tests under `tests/`. The protected replay runs the same learner tests against the vulnerable head and the remediation; they must fail before and pass after.

7. Commit the fixes and tests first. Run an independent recheck of that exact commit, then add the evidence in a separate commit and raise the focused PR.

## Evidence

Submit:

- The fixed application and learner regression tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/review.json` and `evidence/review.md` covering every required finding and dismissal.
- Raw Semgrep JSON, protected fixture output, before-and-after regression replay output, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, exact review range, application quality, confirmed fixes, regression tests, finding quality, false-positive justification, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- The exact protected base and head SHAs are reviewed and every scanner warning is independently reproduced or dismissed.
- Every supported issue is fixed at the correct boundary and every unsupported scanner claim is dismissed with direct evidence.
- The same learner regression tests fail on the protected vulnerable head and pass after remediation.
- `npm run verify:exercise` passes and all review claims map to code, test, or scanner proof.
