# Exercise 03 : Performance and Accessibility Release Gate

## Your Mission

Your team is ready to merge a dashboard because it looks correct, even though its first render is slow and an icon action has no accessible name. Your mission is to fix both defects and build a release gate that cannot hide a bad browser run.

The repository has baseline reports but no enforceable pessimistic decision. Averages or optimistic scores can make a regression appear acceptable.

Compare an ordinary visual-fix attempt with a measured performance and accessibility gate backed by raw browser evidence.

The duration for this challenge is 45 min or less.

## Project

[quality-gate-app](./quality-gate-app) contains the dashboard and protected evidence harness. The [quality gate brief](./docs/quality-gate-brief.md), thresholds, baseline reports, and [gate CLI contract](./docs/gate-cli-contract.md) define the release decision.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, ask a fresh coding agent to fix and prove the dashboard quality issue without extra guidance. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review whether the first result proves production-build performance, accessible naming, run count, worst-case thresholds, axe results, and failure behavior.

3. In the second branch, remove the startup delay without changing dashboard behavior and give the icon action an accessible name.

4. Create `lighthouserc.json` for exactly three production-build runs and `scripts/quality-gate.mjs` with the required CLI. Use the worst run for performance, accessibility, and LCP decisions. Any axe violation must fail the gate.

5. Start a fresh agent session under the same agent, model, tools, permissions, prompt, time limit, and first-attempt conditions. Capture three Lighthouse reports and one axe report from the completed implementation.

6. Prove the gate succeeds for valid reports and returns non-zero when one Lighthouse run or the axe result is changed to a protected failing value.

7. Save `evidence/after.md`, `evidence/after.patch`, generated summary, comparison, and command proof. Raise the final PR from the second branch.

## Evidence

Submit:

- The UI fixes, Lighthouse configuration, and quality-gate CLI.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Three raw Lighthouse reports, one raw axe report, the generated quality summary, and `evidence/comparison.md`.
- Captured verification output under `evidence/commands/`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, three raw production audits, axe results, worst-run thresholds, deliberate failure controls, source SHA, and before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- All three audits use the same route, production build, browser environment, and implementation SHA.
- The worst run has performance at least 0.90, accessibility 1.00, LCP at most 2500 ms, and zero axe violations.
- Protected Lighthouse and axe mutations both write a failed decision and return non-zero.
- `npm run verify:exercise` passes and no protected report, threshold, capture script, or generated result is hand-edited.
