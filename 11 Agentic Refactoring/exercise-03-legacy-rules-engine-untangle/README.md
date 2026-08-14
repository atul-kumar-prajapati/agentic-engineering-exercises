# Exercise 03 : Contract-Safe Full-Stack Rules Extraction

## Your Mission

Your team needs a workflow decision policy extracted from a Spring service without changing backend side effects, HTTP JSON, or the React client contract. Your mission is to separate pure validation from orchestration while preserving every observed behavior.

The service currently performs lookup, validation, response construction, and persistence in one method. A careless extraction can reorder exceptions, reject accepted legacy states, mutate before failure, rename JSON fields, or change support-facing text.

Compare an unconstrained extraction with a characterization-first full-stack refactor and prove the contract remains unchanged.

The duration for this challenge is 45 min or less.

## Project

[legacy-rules-api](./legacy-rules-api) contains the Spring endpoint. [legacy-rules-app](./legacy-rules-app) contains protected client checks. The [rules contract](./docs/rules-contract.md) defines behavior that must not move.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, give a fresh coding agent the policy-extraction request without characterization evidence. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review the result for changed lookup order, validation gaps, exception text, response fields, save counts, or client behavior.

3. In the second branch, add one participant characterization test and capture `contract-before.json`. Commit only those two files before production edits.

4. Start another fresh agent session under the same agent, model, tools, permissions, request, time limit, and first-attempt conditions. Add `DecisionPolicy.java` and update only `WorkflowService.java` in a separate refactor commit.

5. The policy may validate but must never read or write a repository. Preserve not-found precedence, the 12-character boundary, accepted unknown statuses, exact exception text, one save after acceptance, and zero saves after rejection.

6. Capture the after contract and run real backend, HTTP, and client checks. Do not silently correct any legacy gap.

7. Save `evidence/after.md`, `evidence/after.patch`, refactor map, rollback, history, command output, and comparison. Raise the PR from the second branch.

## Evidence

Submit:

- The characterization and refactor commits with participant test.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Before and after contract JSON, `refactor-map.md`, `rollback.md`, `history.json`, and `evidence/comparison.md`.
- Captured command output and output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, client quality, backend and HTTP contracts, test-first history, pure policy boundaries, state and save counts, source scope, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- Characterization evidence is committed before production edits and the after contract is identical.
- `DecisionPolicy` is repository-free while `WorkflowService` retains lookup, construction, and persistence.
- Exception order and text, response fields, accepted legacy gaps, rejected-state immutability, and save counts remain unchanged.
- `npm run verify:exercise` passes and Git history proves the required test-first and focused-refactor sequence.
