# Exercise 02 : Independent Diff Triage

## Your Mission

Your mission is to use a fresh reviewer to find merge blockers in an exact caching change without inheriting the implementer's assumptions.

You are given mutable sorting, stale cache updates, filter-triggered clearing, unsafe JSON parsing, and evidence side effects. A plausible reviewer note is also seeded but may be unsupported.

Run an independent first-pass review, classify every finding, reject noise with evidence, and fix only supported blockers.

The duration for this challenge is 30 min or less.

## Project

[fresh-review-app](./fresh-review-app) contains the application. `fixtures/review-target.bundle` and its manifest define the exact protected range; [reviewer noise](./docs/reviewer-noise.md) must be independently checked.

## How To Go About It

Start a fresh agent or session with the diff, acceptance context, and review rubric only. Do not provide implementation chat or expected defect names.

Classify findings as blocker, non-blocker, or unsupported. Prove scenarios from the diff and mounted code, then add focused regression tests for supported blockers without unrelated refactoring.

## Evidence

Submit fixes and tests, `evidence/fresh-review.md`, the independent reviewer conditions, fixture verification output, and focused test output.

Run `node scripts/verify-review-fixture.mjs`, `npm run test:submission`, and `npm run agent:check` from the documented directories.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check the exact range, reviewer independence, state and mutation scenarios, explicit handling of the seeded claim, and minimal blocker fixes.

The exercise is incomplete if implementation context is leaked, a different diff is reviewed, noise is repeated without checking, or supported blockers remain untested.

See the [Independent Diff Triage rubric](../../docs/EVALUATION_RUBRICS.md#independent-diff-triage).
