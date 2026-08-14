# Exercise 03 : Minimal-Diff Scope Budget

## Your Mission

Your team needs one export button migrated, but coding agents keep turning the task into a shared legacy cleanup. Your mission is to deliver the correct change while proving the implementation stayed inside a declared file and line budget.

The same helper serves export, checkout, destructive actions, and other legacy actions. A broad rewrite increases context, review cost, and regression risk beyond the request.

Compare an unconstrained implementation with a pre-declared minimal-diff plan and preserve every non-export behavior.

The duration for this challenge is 30 min or less.

## Project

[minimal-diff-app](./minimal-diff-app) contains the seeded variant helper and protected behavior checks. The [scope contract](./docs/scope-contract.md) defines allowed source files and budget.

The production change is to map only the export action to `ds-secondary`.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, give a fresh coding agent the production change without a scope budget. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review the first diff for unnecessary files, unrelated cleanup, changed legacy behavior, and added-plus-deleted lines.

3. In the second branch, commit only `evidence/scope-plan.json` and `evidence/scope-plan.md` before editing code. Declare exactly two source paths and no more than 40 added-plus-deleted lines.

4. Start another fresh agent session with the scope plan under the same agent, model, tools, permissions, request, time limit, and first-attempt conditions.

5. Implement the smallest change that maps export to `ds-secondary`. Checkout, delete, and unknown actions must remain unchanged. Do not edit shared components, styles, packages, or unrelated call sites.

6. Commit the helper and one focused learner test together. Add final evidence only after the source commit without changing source again.

7. Save `evidence/after.md`, `evidence/after.patch`, `scope-budget.json`, `avoided-work.md`, `verification.md`, and comparison. Raise the final PR from the second branch.

## Evidence

Submit:

- The focused migration and learner test.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- The pre-change scope plan, final scope ledger, avoided-work record, verification, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, export and legacy behavior, Git path and line budgets, plan-before-code history, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- The scope plan is committed before code and declares exactly the allowed helper and learner-test paths.
- The source commit changes only those two paths and uses no more than 40 added-plus-deleted lines.
- Export uses `ds-secondary` while checkout, delete, and unknown action behavior remains unchanged.
- `npm run verify:exercise` passes and the final ledger matches the actual Git diff exactly.
