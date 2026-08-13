# Exercise 03 : Minimal-Diff Scope Budget

## Your Mission

Your mission is to migrate one export action to the design system without allowing the agent to turn it into a repository-wide cleanup.

You are given shared legacy button code used by checkout, destructive actions, and export. A broad refactor is tempting but increases review cost and regression risk.

Change only the export slice, preserve unrelated call sites, and prove both the requested behavior and the work deliberately left untouched.

The duration for this challenge is 30 min or less.

## Project

[minimal-diff-app](./minimal-diff-app) contains the seeded migration boundary. [scope contract](./docs/scope-contract.md) defines the allowed files and behavior.

## How To Go About It

Set a file and changed-line budget before editing. Inspect only the export path and its direct dependencies, then implement the smallest independently testable change.

If the budget must expand, record the blocking evidence before changing more files. Do not reformat, rename, or migrate unrelated button call sites.

## Evidence

Submit the migration and tests, `evidence/scope-budget.json`, `evidence/avoided-work.md`, and `evidence/verification.md` covering export and protected non-export behavior.

Run `npm run test:migration`, `npm run test:submission`, and `npm run agent:check` from `minimal-diff-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check correct export behavior, unchanged checkout and destructive paths, the declared budget, actual diff scope, and absence of unrelated cleanup.

The exercise is incomplete if shared legacy code is broadly rewritten, the budget is written after the change, unrelated files move, or scope is reduced by skipping verification.

See the [Minimal-Diff Scope Budget rubric](../../docs/EVALUATION_RUBRICS.md#minimal-diff-scope-budget).
