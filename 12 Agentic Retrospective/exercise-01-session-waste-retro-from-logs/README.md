# Exercise 01 : Trace-Measured Session Waste Reduction

## Your Mission

Your team knows coding-agent sessions are wasting time and tokens, but its analyzer labels useful work as waste. Your mission is to correct the measurement, remove the largest preventable behavior, and prove the improvement in a comparable fresh replay.

The trace contains repeated failed commands without diagnosis, an oversized context load, and a completion claim after code changed without final verification. First reads, changed-file rereads, and useful failures must not be misclassified.

Use event-level evidence to choose one executable workflow improvement and measure its effect.

The duration for this challenge is 45 min or less.

## Project

[session-waste-app](./session-waste-app) contains the seeded analyzer and protected tests. The [metric contract](./docs/metric-contract.md), [baseline trace](./docs/session-events.json), and [session conditions](./docs/session-metadata.json) are immutable inputs.

## How To Go About It

1. Run the protected baseline through the supplied analyzer. Save the starting commit, raw metrics, classifications, and implementation patch in `evidence/before.md` and `evidence/before.patch`.

2. Classify an event as preventable only when it is a same-version duplicate read, an identical failed command repeated before diagnosis or workspace change, or a context load above 8,000 bytes.

3. Correct the analyzer so first reads, reads after a file changes, diagnosed retries, and useful failures are not counted as waste. A passed final verification must occur after the last write.

4. Implement `preflightPolicy.mjs` so a failed command cannot repeat at the same workspace revision until a diagnosis event or revision change. Add participant tests.

5. Commit only the analyzer, preflight, and test as one focused source commit.

6. Run the same POLICY-217 prompt in a fresh session with the same agent, model, tools, permissions, and limit. Keep the raw replay events and do not edit them.

7. Save `evidence/after.md`, `evidence/after.patch`, after metrics, retrospective, replay report, history, and comparison. Raise a focused PR containing the executable improvement and proof.

## Evidence

Submit:

- The corrected analyzer, executable preflight, and participant test.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Baseline and replay events, metadata, generated metrics, retrospective, replay report, history, and `evidence/comparison.md`.
- Captured command output and output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, event classifications, retry policy, replay comparability, measured waste reduction, final verification timing, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Baseline and replay conditions match and all metrics are derived from raw events.
- Event classifications follow the metric contract and useful work is not counted as preventable waste.
- The executable preflight blocks an unchanged failed-command retry until diagnosis or revision change.
- Unchanged retries reach zero, preventable calls fall by at least two, and final verification passes after the last write.
- `npm run verify:exercise` passes and the source commit remains focused.
