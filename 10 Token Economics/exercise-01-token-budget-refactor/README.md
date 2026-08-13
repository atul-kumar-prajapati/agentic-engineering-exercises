# Exercise 01 : Progressive Context Budget Refactor

## Your Mission

Your mission is to complete a dependency-sensitive refactor without loading an entire documentation pack into the agent context.

You are given a context selector that always returns every document. It wastes tokens, includes stale migration notes, and can push the current API contract out of the useful context window.

Implement progressive context selection that always includes repository rules, adds only task-relevant sources, and stays within the supplied byte budget.

The duration for this challenge is 30 min or less.

## Project

[token-budget-app](./token-budget-app) contains the seeded selector. [context catalog](./docs/context-catalog.json) identifies source cost, tags, authority, and staleness.

## How To Go About It

Record the task and context budget before reading the large document pack. Start from file names and metadata, select the smallest authoritative set, then expand only when a recorded question cannot be answered.

Fix the selector and verify relevant, irrelevant, stale, mandatory, and over-budget cases. Do not remove required context merely to improve the cost number.

## Evidence

Submit the selector and tests, `evidence/context-plan.md`, `evidence/context-ledger.json`, and `evidence/decision.md` showing what was loaded, skipped, expanded, and why.

Run `npm run test:context`, `npm run test:submission`, and `npm run agent:check` from `token-budget-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check mandatory repository context, authoritative source preference, relevance, stale-source exclusion, deterministic budgeting, and correct behavior under the maximum byte limit.

The exercise is incomplete if the full pack is loaded, required rules are omitted, cost evidence is estimated after the work, or correctness is traded for a lower token count.

See the [Progressive Context Budget Refactor rubric](../../docs/EVALUATION_RUBRICS.md#progressive-context-budget-refactor).
