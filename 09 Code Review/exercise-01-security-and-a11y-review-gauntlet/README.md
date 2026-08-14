# Exercise 01 : Security and Accessibility Review Gauntlet

## Your Mission

Your team is about to merge a PR that mixes real security, accessibility, and workflow-policy regressions with a safe scanner look-alike. Your mission is to review the exact diff, separate signal from noise, and fix every confirmed blocker at the correct boundary.

The PR adds an untrusted HTML sink, removes keyboard semantics, drops client validation, and lets approval wording bypass server rules. A static source-controlled string deliberately triggers the same scanner rule but is safe.

Produce a review whose findings, dismissals, fixes, and regression tests can all be reproduced.

The duration for this challenge is 45 min or less.

## Project

[review-gauntlet-app](./review-gauntlet-app) contains the vulnerable head state. `fixtures/review-target.bundle` and `fixtures/manifest.json` define the exact protected `review-base..review-head` range.

## How To Go About It

1. Verify and clone the protected bundle. Record the exact base and head SHAs, initial check results, and vulnerable patch in `evidence/before.md` and `evidence/before.patch`.

2. Start a fresh review session for only that range. Run the supplied Semgrep rule against the head, but reproduce every warning before deciding whether it is a blocker.

3. Inspect note rendering, queue keyboard behavior, client validation, and the server transition boundary. Do not treat scanner output as the complete review.

4. Record every required finding using the [finding contract](./docs/finding-contract.md). Classify the dynamic note sink as a true positive and justify the static announcement as a false positive with source evidence.

5. Fix confirmed blockers at the smallest correct boundary. Do not remove the safe static scanner finding merely to silence the tool.

6. Add focused regression tests under `tests/` for untrusted note rendering, keyboard behavior, note validation, and blocked or escalated transition rules.

7. Run an independent recheck of the fixed commit. Save `evidence/after.md`, `evidence/after.patch`, raw scanner output, review files, and comparison, then raise the focused PR.

## Evidence

Submit:

- The fixed application and learner regression tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/review.json` and `evidence/review.md` covering every required finding and dismissal.
- Raw Semgrep output, protected fixture output, focused test output, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, exact review range, application quality, confirmed fixes, regression tests, finding quality, false-positive justification, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- The exact protected base and head SHAs are reviewed and every scanner warning is independently reproduced or dismissed.
- The dynamic sink is fixed while the safe static finding is retained and justified.
- Keyboard semantics, note validation, and server-side transition policy blockers are found and fixed.
- Regression tests prove notes render as text, rows remain native buttons, short notes fail, and blocked or escalated work cannot reach Ready.
- `npm run verify:exercise` passes and all review claims map to code, test, or scanner proof.
