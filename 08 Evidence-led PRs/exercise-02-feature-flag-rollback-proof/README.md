# Exercise 02 : Feature Flag Kill-Switch Proof

## Your Mission

Your team cannot safely release an invoice preview because disabling its flag still calls the new service and emits telemetry. Your mission is to repair the flag boundary and prove the feature can be disabled immediately without a code deployment.

The current code fails open when the provider errors, uses side effects on disabled paths, and has no atomic rollback command that reviewers can run.

Compare an ordinary implementation attempt with an evidence-led rollout and rollback result.

The duration for this challenge is 75 min or less.

## Project

[feature-flag-app](./feature-flag-app) contains the rollout boundary and verification harness. The protected flag brief, [rollback contract](./docs/rollback-contract.md), configuration, and scenarios define the required behavior.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, ask a fresh coding agent to repair the flag and provide rollback proof from the product request. Do not provide hints, corrections, or retries. Commit that untouched attempt, keep the commit available in local Git history, and save `evidence/before.md` and `evidence/before.patch` from it.

2. Review the first result against the flag and rollback contracts. Record any unproved disabled, error, targeting, side-effect, or rollback behavior.

3. In the second branch, use the provider-independent `getBooleanValue` interface. Evaluate `invoice-preview-v2` with a safe `false` default and the unchanged account targeting key.

4. Only the enabled path may call the preview API or emit `invoice_preview_viewed`. Invalid context, disabled evaluation, provider failure, and preview API failure must return the legacy experience without those side effects.

5. Create `scripts/rollback-invoice-preview.mjs` with the required CLI. It must validate input first, reject a stale expected revision, atomically disable the flag, clear targeting, and record the required audit fields. The protected drill traces the actual lock, revision read, temporary write, and rename. It interrupts after the temporary write and forces two rollback commands to overlap.

6. Start a fresh agent session under the same agent, model, tools, permissions, prompt, time limit, and first-attempt conditions. Capture enabled, disabled, provider-error, invalid-input, and rollback behavior without correction or retry.

7. Commit the implementation first. Generate proof from that exact SHA, then add `evidence/after.md`, `evidence/after.patch`, the rollback drill, and comparison in an evidence-only commit. Raise the PR only from the second branch.

## Evidence

Submit:

- The corrected rollout boundary and rollback command.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Generated enabled, disabled, and provider-error results.
- Generated rollback drill JSON and Markdown, captured command output, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, all flag states, side effects, stable targeting, rollback atomicity, generated evidence, and required comparison proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- Only enabled evaluation calls the preview API and emits preview telemetry, exactly once.
- Invalid context, disabled state, provider error, and preview API failure return legacy behavior with zero new side effects.
- The rollback drill proves the filesystem operation order, rejects invalid input, survives interruption after the temporary write, and allows only one of two overlapping attempts to replace the same revision. Only the successful rollback command is measured against the 1000 ms objective.
- `npm run verify:exercise` passes and all generated proof matches one implementation source SHA.
