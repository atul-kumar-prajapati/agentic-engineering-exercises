# Exercise 03 : Trace-Backed Workflow Optimizer

## Your Mission

Your team uses a reusable coding-agent workflow that repeatedly produces early edits, missed contradictions, partial verification, and unsupported completion claims. Your mission is to improve only the workflow instructions and prove the change generalizes without excessive context cost.

Past traces show multiple failure patterns, but copying specific case answers into the instructions would create a benchmark-only fix.

Cluster root causes, run matched first-attempt baselines and candidates, and adopt only when protected held-out results improve.

The duration for this challenge is 60 min or less.

## Project

[workflow-optimizer-app](./workflow-optimizer-app) contains the baseline workflow, eight replay cases, deterministic grader, and protected thresholds. [Failure traces](./docs/failure-traces.json) are the only evidence for changing the workflow.

## How To Go About It

1. Record the baseline workflow commit and patch in `evidence/before.md` and `evidence/before.patch`.

2. Run all eight cases three times at the baseline commit with fixed agent, model, settings, tools, permissions, and time limit. Save every raw structured response, response hash, token count, and duration.

3. Group trace failures by root cause before editing. Map each proposed workflow change to multiple observed failures.

4. Create one candidate commit that changes only `workflow/instructions.md`. Keep the guidance general and do not include case IDs, assertion IDs, expected outputs, or fixture wording.

5. Repeat all 24 cases with only the workflow changed. Do not select or rerun individual failures. Save the candidate state in `evidence/after.md` and `evidence/after.patch`.

6. Generate grades and the benchmark from raw results. Compare train and held-out quality, critical assertions, variance, tokens, and elapsed time.

7. Write the failure clusters, adoption decision, history, and comparison. Adopt only if every protected quality, safety, variance, token, and time gate passes.

## Evidence

Submit:

- The candidate workflow and focused candidate commit.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- All 48 raw baseline and candidate results with metadata and hashes.
- Generated benchmark, `failure-clusters.md`, `adoption.md`, `history.json`, `evidence/comparison.md`, and command output.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, raw-run completeness, matched conditions, deterministic grades, held-out safety, variance, cost, candidate scope, leakage, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Exactly 48 first-attempt runs use matching conditions and every grade is derived from a raw response hash.
- Workflow changes are supported by repeated trace causes and the candidate commit changes only `workflow/instructions.md`.
- Train and held-out quality improve, every held-out critical assertion passes, and variance remains within the protected limit.
- Median tokens and elapsed time remain within limits and no benchmark identifiers leak into the workflow.
- `npm run verify:exercise` passes and the adoption decision matches the generated benchmark.
