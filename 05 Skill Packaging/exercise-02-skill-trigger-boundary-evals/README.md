# Exercise 02 : Skill Trigger Boundary Evals

## Your Mission

Your mission is to repair a skill description that triggers for the wrong work and stays hidden for the work it should handle.

You are given three neighbouring skills and a vague `change-review` description. It collides with release notes and incident summaries, while paraphrased code-review requests often miss it.

Use the skill-creator workflow to build positive and negative trigger evals, improve the description, and prove the result on held-out requests.

The duration for this challenge is 30 min or less.

## Project

[skill-trigger-app](./skill-trigger-app) contains the real skill catalog, protected held-out requests, and the result verifier.

## How To Go About It

Install the official [skill-creator skill](https://github.com/anthropics/skills/tree/main/skills/skill-creator).

Create realistic should-trigger and should-not-trigger requests. Keep 40 percent as held-out cases, run each request three times, and record the original description's results before editing it.

Improve only the real `SKILL.md` description. Rerun the same cases and select the description by held-out score, not training score. Do not encode exact eval wording in the skill.

## Evidence

Submit the updated skill, `evals/trigger-evals.json`, raw before and after results, and `evidence/trigger-evaluation.md` containing model, settings, three-run trigger rates, train score, held-out score, false positives, false negatives, and adoption decision.

Run `npm run eval:fixtures`, `npm run test:submission`, and `npm run agent:check` from `skill-trigger-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that requests are substantive, positive and negative boundaries include confusing neighbours, and every result comes from actual trigger decisions.

The final description must improve held-out performance without overfitting or changing the skill instructions to recognize exact test phrases.

The exercise is incomplete if held-out cases are edited, only deterministic keyword matching is used as final evidence, runs are missing, protected inputs are changed, or required checks fail.

See the [Skill Trigger Boundary Evals rubric](../../docs/EVALUATION_RUBRICS.md#skill-trigger-boundary-evals).
