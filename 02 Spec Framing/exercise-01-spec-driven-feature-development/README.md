# Exercise 01 : Spec-Driven Feature Development

## Your Mission

Your mission is to turn an unclear product request into an implementation-ready engineering specification before any code is written.

You are given a working subscription application and a vague request. The repository contains incomplete and conflicting information about permissions, billing, pending changes, and failures. A coding agent may silently invent these decisions and create an incorrect specification.

Create the clarifications, specification, technical plan, and implementation tasks needed to remove important ambiguity.

You must also prove that clarification improves the agent's output by comparing its work before and after the important decisions are documented.

The duration for this challenge is 30 min or less.

## Project

[subscription-management-app](./subscription-management-app) contains the application code for this exercise.

Use the following feature request for both agent runs:

> Allow users to manage their subscriptions.

Do not implement the feature. Your final output must be a clear and traceable specification that another engineer or coding agent could implement safely.

## How To Go About It

First, give the feature request to a coding agent in a fresh session without providing clarification documents. Ask it to create a specification, plan, and implementation tasks.

Record the decisions it invented, the questions it did not ask, and any unclear requirements. Save its work as evidence, then revert the generated artifacts.

Next, inspect the application, feature request, stakeholder notes, and billing constraints.

Create `specs/clarifications.md` containing three to five important questions. For each question, include the available repository evidence, the confirmed answer or explicit assumption, and the consequence of that decision.

The clarifications must address:

- Who can manage a subscription.
- When billing changes take effect.
- How pending changes and failures are handled.
- What is outside the feature scope.

Start another fresh agent session and give it the same feature request with the clarification document available. Ask it to create:

- `specs/spec.md`
- `specs/plan.md`
- `specs/tasks.md`

Requirements, acceptance criteria, plan items, and tasks must use identifiers so reviewers can trace each task back to the original requirement.

Use the same agent, model, tools, permissions, and time limit for both runs. Do not rerun a session to obtain a preferred result.

## Evidence

Submit:

- `specs/clarifications.md`, `specs/spec.md`, `specs/plan.md`, and `specs/tasks.md`.
- `evidence/before.md` describing the first agent's assumptions and missing decisions.
- `evidence/before.patch` containing the first specification attempt.
- `evidence/after.md` describing the agent's result after clarification.
- `evidence/after.patch` containing the final specification artifacts.
- `evidence/comparison.md` explaining what improved after clarification.
- Output from `npm run spec:verify` and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the supplied [specification contract](./docs/specification-contract.md), [evidence template](./docs/evidence-template.md), and repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that the clarification questions address real gaps, assumptions and consequences are explicit, conflicting information is resolved, acceptance criteria are testable, and every implementation task can be traced back to a requirement.

The exercise is incomplete if the agent silently invents important behavior, the documents contain generic placeholders, or feature implementation begins before the specification is ready.

See the [Spec-Driven Feature Development evaluation rubric](../../docs/EVALUATION_RUBRICS.md#spec-driven-feature-development).
