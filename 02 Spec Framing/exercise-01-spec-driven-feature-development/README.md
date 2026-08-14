# Exercise 01 : Spec-Driven Feature Development

## Your Mission

Your team keeps starting subscription features from unclear requests, which leads to rework and conflicting implementations. Your mission is to turn one vague request into a clear, testable, and implementation-ready specification before any feature code is written.

The repository contains conflicting information about permissions, billing timing, pending changes, and failures. A coding agent can easily hide unanswered questions behind confident-looking requirements.

Create the missing clarifications, then prove that they improve the specification produced by a fresh agent.

The duration for this challenge is 30 min or less.

## Project

[subscription-management-app](./subscription-management-app) is a subscription application with stakeholder notes, billing constraints, and existing behavior that do not fully agree.

Use this product request in both agent sessions:

> Allow users to manage their subscriptions.

Do not implement the feature. The required outcome is a specification that another engineer or coding agent can implement without inventing important product behavior.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the documents produced in the first branch.

2. In the first branch, start a fresh agent session without clarification documents. Give it the product request exactly as written and ask for a specification, technical plan, and implementation tasks. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Inspect the application, stakeholder notes, billing constraints, and [specification contract](./docs/specification-contract.md). Identify three to five important questions covering authorization, billing timing, pending changes, failure recovery, and scope.

4. In the second branch, create `specs/clarifications.md`. For every question, cite repository evidence, record whether the answer is confirmed or assumed, state the decision, and explain its consequence.

5. Start another fresh agent session with the clarification file available. Give it the same product request using the same agent, model, tools, permissions, and time limit. Ask it to create `specs/spec.md`, `specs/plan.md`, and `specs/tasks.md`. Do not provide hints, corrections, or retries.

6. Keep the second result. Requirements, acceptance criteria, plan items, and tasks must have identifiers, and every task must trace to the requirement and acceptance criteria it implements.

7. Save `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`. Raise the final PR only from the second branch. Do not add feature implementation code.

## Evidence

Submit:

- `specs/clarifications.md`, `specs/spec.md`, `specs/plan.md`, and `specs/tasks.md`.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` connecting at least three improvements to clarification and requirement identifiers.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the specification and evidence changes.

Run `npm run verify:exercise` before raising the PR. It checks starter integrity, application quality, clarification coverage, document structure, traceability, comparable sessions, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both sessions use the same product request and working conditions.
- Three to five evidence-based questions resolve or explicitly record the important assumptions.
- The final specification covers authorization, billing timing, pending changes, failure recovery, and scope with testable acceptance criteria.
- Every requirement and acceptance criterion is traced into the plan and tasks.
- No feature code is implemented and no protected starter input is changed.
- `npm run verify:exercise` passes and the final PR contains all required proof.
