# Exercise 01 : Characterization-First Rules Refactor

## Your Mission

Your mission is to simplify a renewal-eligibility function without changing the undocumented behavior that current callers depend on.

You are given nested conditions, misleading names, and surprising edge cases. Some behavior looks wrong but no approved requirement authorizes a bug fix during this refactor.

Capture the current behavior before editing, classify surprising cases, refactor one rules slice, and prove the observable outputs remain unchanged.

The duration for this challenge is 30 min or less.

## Project

[rules-refactor-app](./rules-refactor-app) contains the legacy rule. [golden cases](./docs/renewal-golden-cases.json) are protected observations, not permission to rewrite expected values.

## How To Go About It

Run the oracle and add characterization tests around public inputs and outputs. Record each surprising result as preserve, approved change, or suspected bug; only preserve is authorized in this exercise.

Refactor in small steps with the tests green after each step. Improve names and decision structure without changing the exported contract or coupling tests to private helpers.

## Evidence

Submit the refactor and characterization tests, `evidence/before-output.json`, `evidence/after-output.json`, `evidence/behavior-decisions.md`, and `evidence/refactor-steps.md`.

Run `npm run test:oracle`, `npm run test:submission`, and `npm run agent:check` from `rules-refactor-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that characterization precedes refactoring, tests use public behavior, every golden case is preserved, and suspected bugs are documented rather than silently changed.

The exercise is incomplete if expected outputs are edited to match the refactor, tests assert private helpers, behavior changes without approval, or the before snapshot is recreated afterward.

See the [Characterization-First Rules Refactor rubric](../../docs/EVALUATION_RUBRICS.md#characterization-first-rules-refactor).
