# Exercise 02 : Skill Trigger Boundary Evals

## Your Mission

Your team's code-review skill activates for unrelated requests and stays silent for reviews it should handle. Your mission is to repair only its description and prove the new trigger boundary with repeated positive, negative, and held-out evaluations.

The catalog contains three similar skills. The current `change-review` description collides with release notes, incident reports, implementation work, and ordinary summaries.

Measure the original behavior first, improve it without changing the skill body, then prove the result on requests that were not used for tuning.

The duration for this challenge is 45 min or less.

## Project

[skill-trigger-app](./skill-trigger-app) contains the skill catalog, 20 protected trigger requests, the original skill snapshot, deterministic scoring, and held-out gates. Read the [catalog boundaries](./docs/catalog-boundaries.md).

The allowed implementation change is only the `description` field in `skills/change-review/SKILL.md`.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must preserve the original skill body and all protected cases.

2. Install the official [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator). In the first branch, run every protected request three times with the original skill. Do not edit the skill or cases. Save the 60 decisions, `evidence/before.md`, `evidence/before.patch`, and `evidence/before-results.json`.

3. Analyze only the training false positives and false negatives. Identify which use and non-use boundaries are missing without copying case wording into the description.

4. In the second branch, change only the `change-review` description. Keep the skill instructions, neighboring skills, scoring code, and protected requests unchanged.

5. Rerun every request three times with the same agent, model, runtime, settings, repository state, and first-attempt conditions. Save all 60 decisions in `evidence/after-results.json`.

6. Select or reject the new description using held-out accuracy, recall, specificity, stability, and improvement. Do not tune again after reading held-out failures.

7. Save `evidence/after.md`, `evidence/after.patch`, the skill record, trigger analysis, and comparison. Raise the final PR only from the second branch.

## Evidence

Submit:

- The updated `skills/change-review/SKILL.md`.
- `evidence/before.md`, `evidence/before.patch`, and `evidence/before-results.json`.
- `evidence/after.md`, `evidence/after.patch`, and `evidence/after-results.json`.
- `evidence/skill-record.md`, `evidence/trigger-analysis.md`, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, skill integrity, all 120 decisions, matching run conditions, training and held-out scores, stability, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Before and after results contain three real decisions for every protected request under matching conditions.
- Only the `change-review` description changes, and it states clear use and non-use boundaries without held-out wording.
- Training accuracy is at least 10 of 12 and held-out accuracy at least 7 of 8.
- Held-out recall and specificity are each at least 75 percent, decisions are stable, and the held-out score improves.
- `npm run verify:exercise` passes and the final PR contains all required proof.
