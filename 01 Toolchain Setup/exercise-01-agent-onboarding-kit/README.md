# Exercise 01 : Agent Onboarding Kit

## Your Mission

Your mission is to configure a coding agent so it can understand and work on a repository like a new engineering teammate.

You are given a repository that contains a working application with limited documentation, mixed coding patterns, hidden conventions, and missing onboarding instructions.

Create the complete agent setup by documenting the project rules, architecture, workflows, testing process, and coding conventions.

You must also prove that your setup improves how the agent works by comparing its behaviour before and after adding the onboarding instructions.

The duration for this challenge is 30 min or less.

## Project

[agent-onboarding-app](./agent-onboarding-app) contains the application code for this exercise.

The application contains an intentional bad practice: important business rules are copied in multiple files. Without proper guidance, a coding agent may copy the same rules again while implementing a feature.

Use the following feature request to test the agent:

> Add a Needs Attention filter that shows cases that have waited too long or have high customer revenue risk. Use the existing business rules and keep the filter count, displayed results, and sorting consistent.

## How To Go About It

First, run the feature request in a fresh agent session without creating `AGENTS.md` or any `.agent` documents. Record how the agent approached and implemented the feature. Revert its changes after collecting the evidence.

Next, ask your coding agent to inspect `agent-onboarding-app/` and understand the codebase structure, existing patterns, commands, and development workflow.

Create an agent configuration layer using:

- `agent-onboarding-app/AGENTS.md`
- `agent-onboarding-app/.agent/architecture.md`
- `agent-onboarding-app/.agent/development-workflow.md`
- `agent-onboarding-app/.agent/testing.md`

The setup should explain where shared business rules belong, how to avoid copying bad patterns, and which checks must be run before completing a change.

Finally, start another fresh agent session and give it the same feature request. Compare this result with the first run and keep the improved implementation.

Use the same model, tools, permissions, and time limit for both runs. Do not rerun a session to obtain a preferred result.

## Evidence

Submit:

- `AGENTS.md` and the required files inside `.agent/`.
- `evidence/before.md` describing the agent's behaviour before onboarding.
- `evidence/before.patch` containing the first implementation.
- `evidence/after.md` describing the agent's behaviour after onboarding.
- `evidence/after.patch` containing the final implementation.
- `evidence/comparison.md` explaining what improved and which instructions influenced the agent.
- Output from `npm run agent:check` and `npm run test:follow-up`.
- A focused pull request containing only the exercise changes.

Use the supplied [evidence template](./docs/evidence-template.md) and follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that the comparison is fair, the onboarding guidance is clear, the evidence is accurate, and the final implementation avoids copying business rules while keeping the filter count, displayed results, and sorting consistent.

See the [Agent Onboarding Kit evaluation rubric](../../docs/EVALUATION_RUBRICS.md#agent-onboarding-kit).
