# Exercise 01 : Agent Onboarding Kit

## Your Mission

Your mission is to configure a coding agent to work safely and consistently in an unfamiliar repository.

The application has limited documentation, hidden conventions, mixed patterns, and duplicated business rules. Without guidance, an agent may copy the existing bad practice while implementing a feature.

Create the agent onboarding instructions and compare the agent's implementation before and after adding them.

The duration for this challenge is 30 min or less.

## Project

[agent-onboarding-app](./agent-onboarding-app) contains the application code and an intentional antipattern: important business rules are duplicated across multiple files.

Use this request for both agent runs:

> Add a Needs Attention filter that shows cases that have waited too long or have high customer revenue risk. Use the existing business rules and keep the filter count, displayed results, and sorting consistent.

## How To Go About It

Start a fresh agent session without `AGENTS.md` or `.agent` documents. Provide the feature request, save the first implementation and observations, then revert the implementation.

Inspect the application structure, business rules, coding patterns, commands, tests, and development workflow.

Create:

- `agent-onboarding-app/AGENTS.md`
- `agent-onboarding-app/.agent/architecture.md`
- `agent-onboarding-app/.agent/development-workflow.md`
- `agent-onboarding-app/.agent/testing.md`

The instructions must explain:

- Where shared business rules belong.
- How to avoid copying existing bad patterns.
- How to implement and verify repository changes.
- Which checks must pass before completion.

Start another fresh agent session with the onboarding files available and provide the same feature request. Keep the improved implementation.

Use the same agent, model, tools, permissions, prompt, time limit, and first attempt for both runs. Do not rerun either attempt.

## Evidence

Submit:

- `AGENTS.md` and the required `.agent` files.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` explaining what improved and which instructions influenced the result.
- Output from `npm run agent:check` and `npm run test:follow-up`.
- A focused pull request containing only the exercise changes.

Use the [evidence template](./docs/evidence-template.md) and follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The onboarding instructions must be clear, repository-specific, and sufficient for a fresh agent to complete the feature without duplicating business rules.

The final implementation must use one source of business rules and keep the filter count, displayed results, and sorting consistent.

The exercise is incomplete if the runs are not comparable, onboarding files contain generic guidance, the final implementation copies the antipattern, protected inputs are changed, or the required checks fail.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#agent-onboarding-kit).
