# Exercise 01 : Characterization-First Rules Refactor

## Your Mission

Your team needs a complex renewal rule simplified, but nobody can confirm which surprising behaviors current callers depend on. Your mission is to refactor the internal decision structure without changing any observable result.

The function allows support overrides, accepts negative late-payment counts, and rejects some mature accounts as `plan-not-supported`. These may be bugs, but this task does not authorize behavior changes.

Compare an unconstrained agent refactor with a characterization-first workflow and prove every output remains identical.

The duration for this challenge is 45 min or less.

## Project

[rules-refactor-app](./rules-refactor-app) contains the legacy function and protected oracle. [Golden cases](./docs/renewal-golden-cases.json) are observed behavior and must not be edited.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, give a fresh coding agent the refactor request without a characterization requirement. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review the first result for changed outputs, reason strings, validation gaps, decision order, public API, or tests coupled to private helpers.

3. In the second branch, add one characterization test that calls only `evaluateRenewalEligibility`, capture `before-output.json`, and commit those two files before production edits.

4. Classify every surprising case as preserve or suspected bug. This challenge authorizes preserve only.

5. Start a fresh agent session under the same agent, model, tools, permissions, request, time limit, and first-attempt conditions. Refactor only `legacyEligibility.mjs` in a separate commit.

6. Preserve the export, inputs, result fields, exact reason strings, validation gaps, and decision order. Capture `after-output.json` from the refactored code and compare it byte-for-byte with the baseline.

7. Save `evidence/after.md`, `evidence/after.patch`, behavior decisions, refactor steps, command proof, and comparison. Raise the PR from the second branch.

## Evidence

Submit:

- The characterization-first and refactor commits.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Before and after outputs, `behavior-decisions.md`, `refactor-steps.md`, and `evidence/comparison.md`.
- Captured command output and output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, test-first history, public-only characterization, exact behavior parity, refactor scope, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- Characterization tests and baseline output are committed before production edits and call only the public function.
- Every protected field, value, reason string, validation gap, and decision result is identical before and after.
- The refactor commit changes only `legacyEligibility.mjs`; suspected bugs are documented, not fixed.
- `npm run verify:exercise` passes and Git history proves the required order.
