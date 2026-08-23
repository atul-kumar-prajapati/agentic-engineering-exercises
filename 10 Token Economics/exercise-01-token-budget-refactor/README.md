# Exercise 01 : Progressive Context Budget Refactor

## Your Mission

Your team is spending tokens by loading an entire documentation pack for every coding task, including stale and unrelated guidance. Your mission is to refactor a real session adapter with less context without losing correctness.

The starter selector returns every source. A cheaper but careless selector can omit mandatory repository rules or choose a small secondary note instead of the primary contract.

Compare an unbudgeted agent result with a deterministic, question-driven context selection and prove correctness is not traded for lower cost.

The duration for this challenge is 75 min or less.

## Project

[token-budget-app](./token-budget-app) contains a working legacy adapter, the broken context selector, and protected checks. The [refactor request](./docs/adapter-refactor-request.md) defines the code task. The [context catalog](./docs/context-catalog.json) maps real files to tags, priority, authority, and exact UTF-8 cost.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, run a fresh agent session for the adapter refactor with the full context pack. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch` with context bytes and results.

2. Review which loaded sources were mandatory, relevant, stale, duplicated, or unrelated and which open questions required more context.

3. In the second branch, commit `evidence/context-plan.json` and `evidence/context-plan.md` before changing code. Record task tags, maximum bytes, mandatory rules, open questions, and expected sources.

4. Fix `src/budget/selectContext.mjs`, then refactor `src/session/adaptSession.mjs` using only the selected context. Select mandatory current sources first, then relevant current sources by priority and stable ID. Record why every source was selected or skipped.

5. Reject a budget that cannot fit mandatory context. Never choose stale guidance because it is smaller, and never exceed the declared exact UTF-8 byte budget.

6. Run a fresh agent session with only the selected context using the same agent, model, tools, permissions, request, time limit, and first-attempt conditions. Add focused selector and adapter tests. Both saved patches must pass the protected adapter contract.

7. Save `evidence/after.md`, `evidence/after.patch`, `context-ledger.json`, `decision.md`, and comparison. Raise the PR only from the second branch.

## Evidence

Submit:

- The selector, refactored adapter, and learner regression tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- The pre-change context plan, final context ledger, decision, and `evidence/comparison.md`.
- Captured command output and output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, selector behavior, exact byte accounting, plan-before-code history, context decisions, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent runs use matching conditions and the second receives only its selected context.
- Mandatory repository rules are always selected and current primary sources beat stale, unrelated, or secondary sources.
- Selection is deterministic, exact byte totals are correct, the budget is never exceeded, and impossible budgets fail clearly.
- The context plan predates code changes and the final ledger matches the actual selection and Git history.
- Both the full-context and selected-context patches pass the same protected adapter acceptance checks.
- `npm run verify:exercise` passes and the measured context reduction does not reduce task correctness.
