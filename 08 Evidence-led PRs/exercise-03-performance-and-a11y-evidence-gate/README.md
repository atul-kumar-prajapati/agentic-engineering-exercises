# Exercise 03 : Performance and Accessibility Release Gate

## Your Mission

Your mission is to stop a visually successful UI change from merging when it exceeds the performance budget or loses accessible controls.

You are given a baseline report, an oversized content section, and an unnamed action. A report-only workflow currently produces files but does not fail on regression.

Repair the UI and create one release gate that compares real browser evidence against explicit performance and accessibility thresholds.

The duration for this challenge is 30 min or less.

## Project

[quality-gate-app](./quality-gate-app) contains the generated UI change. Protected baseline reports and [quality gate brief](./docs/quality-gate-brief.md) define the required comparison.

## How To Go About It

Configure [Lighthouse CI](https://googlechrome.github.io/lighthouse-ci/) with at least three runs and pessimistic assertions. Add an automated accessibility check for the mounted page.

Fix the seeded problems, compare the same URL and environment, and make a threshold violation return a non-zero exit code. Do not raise scores by disabling relevant audits.

## Evidence

Submit the UI fix, gate configuration, `evidence/lighthouse-after.json`, `evidence/a11y-after.json`, `evidence/comparison.md`, and the final gate output.

Run `npm run quality:verify`, `npm run test:submission`, and `npm run agent:check` from `quality-gate-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check comparable evidence, three browser runs, performance at or above 0.90, accessibility at 1.00, LCP at or below 2500 ms, and zero accessible-name violations.

The exercise is incomplete if audits are disabled, reports use different environments, only screenshots are supplied, or the gate remains green when a threshold fails.

See the [Performance and Accessibility Release Gate rubric](../../docs/EVALUATION_RUBRICS.md#performance-and-accessibility-release-gate).
