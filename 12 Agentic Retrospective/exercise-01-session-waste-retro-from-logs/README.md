# Exercise 01 : Trace-Measured Session Waste Reduction

## Your Mission

Your mission is to turn an agent session trace into one measurable workflow improvement, then prove it in a fresh replay.

You are given repeated file reads, failed-command retry loops, and a completion claim without final verification. The seeded analyzer overcounts ordinary work and cannot identify the actual waste categories.

Correct the measurements, choose the highest-value preventable waste, implement one durable improvement, and replay an equivalent task.

The duration for this challenge is 30 min or less.

## Project

[session-waste-app](./session-waste-app) contains the analyzer. Protected session events and [usage summary](./docs/usage-summary.md) provide the source evidence.

## How To Go About It

Define duplicate read, failed retry, verification, and useful work before calculating totals. Keep raw events unchanged and make the analyzer derive its output.

Choose one improvement such as a preflight check, context index, or verification gate. Run a fresh comparable task and report whether waste fell without reducing correctness.

## Evidence

Submit the analyzer and tests, `evidence/baseline.json`, `evidence/after.json`, `evidence/retrospective.md`, and `evidence/replay.md` with task conditions and verification results.

Run `npm run test:analysis`, `npm run test:submission`, and `npm run agent:check` from `session-waste-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check derived metrics, category definitions, trace-to-action reasoning, comparable replay conditions, reduced preventable calls, and unchanged correctness.

The exercise is incomplete if raw logs are edited, ordinary work is labeled waste, the improvement is only advice, or the after result lacks a fresh replay.

See the [Trace-Measured Session Waste Reduction rubric](../../docs/EVALUATION_RUBRICS.md#trace-measured-session-waste-reduction).
