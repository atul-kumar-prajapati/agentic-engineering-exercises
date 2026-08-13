# Exercise 01 : Spec-Driven Feature Development

## Your Mission

Your mission is to turn an unclear product request into an implementation-ready specification before writing code.

The application contains conflicting information about permissions, billing, pending changes, and failures. Important decisions must be clarified instead of being silently invented by the coding agent.

Create the clarifications, specification, technical plan, and implementation tasks required to remove these ambiguities.

Compare the agent's output before and after providing the clarifications.

The duration for this challenge is 30 min or less.

## Project

[subscription-management-app](./subscription-management-app) contains the application code and conflicting product information.

Use this request for both agent runs:

> Allow users to manage their subscriptions.

Do not implement the feature. Produce a specification that another engineer or coding agent can implement safely.

## How To Go About It

Start a fresh agent session without clarification documents. Ask the agent to create a specification, plan, and implementation tasks from the feature request. Save the first attempt and observations, then revert the generated artifacts.

Inspect the application, stakeholder notes, billing constraints, and specification contract.

Create `specs/clarifications.md` with three to five important questions. For each question, include:

- Relevant repository evidence.
- The confirmed answer or explicit assumption.
- The consequence of that decision.

The clarifications must resolve:

- Who can manage a subscription.
- When billing changes take effect.
- How pending changes and failures are handled.
- What is outside the feature scope.

Start another fresh agent session with the same feature request and `specs/clarifications.md`. Ask it to create:

- `specs/spec.md`
- `specs/plan.md`
- `specs/tasks.md`

Assign identifiers to requirements, acceptance criteria, plan items, and tasks so every task can be traced to its requirement.

Use the same agent, model, tools, permissions, prompt, time limit, and first attempt for both runs. Do not rerun either attempt.

## Evidence

Submit:

- `specs/clarifications.md`, `specs/spec.md`, `specs/plan.md`, and `specs/tasks.md`.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` explaining what improved.
- Output from `npm run spec:verify` and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [specification contract](./docs/specification-contract.md), [evidence template](./docs/evidence-template.md), and repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The clarification questions must address real gaps, use repository evidence, and distinguish confirmed answers from assumptions.

The final specification must resolve authorization, billing timing, pending changes, failure recovery, and scope. Acceptance criteria must be testable, and every task must trace back to a requirement.

The exercise is incomplete if the runs are not comparable, important behaviour is invented, documents contain placeholders, feature code is implemented, protected inputs are changed, or the required checks fail.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#spec-driven-feature-development).
