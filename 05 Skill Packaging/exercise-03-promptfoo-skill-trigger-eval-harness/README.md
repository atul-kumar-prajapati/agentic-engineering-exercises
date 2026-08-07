# Exercise 03: Promptfoo Skill Trigger Eval Harness

## Objective

Measure and improve skill selection using the actual overlapping `SKILL.md` descriptions.

## Starting Point

Three real skill definitions, a catalog builder, deterministic selector, Promptfoo model configuration, and positive, negative, paraphrased, noisy, ambiguous, and compound cases are supplied.

## Required Implementation Changes

- Build the catalog from `skills/*/SKILL.md`; do not maintain a duplicate metadata catalog.
- Run the deterministic lane and report precision, recall, and confusion cases.
- Run the sampled model lane using the model intended for production selection.
- Improve the weakest real description and rerun both lanes.
- Keep compound or tied cases routed to human review rather than forcing a skill.

## Allowed Changes

Change real skill descriptions, catalog/eval code, cases, and evidence. Do not encode case IDs, expected answers, or exact request phrases in provider selection logic.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `skill-eval-app`:

```text
npm ci
npm run eval:local
set SKILL_EVAL_MODEL=<provider:model>
npm run eval:model
npm run agent:check
```

Use the shell-appropriate environment syntax on non-Windows systems and run the sampled model evaluation at least three times.

## Acceptance Criteria

- Editing a real description changes the generated catalog and can change results.
- Deterministic and sampled lanes both run.
- Results include trigger precision, recall, confusion, abstentions, and human-review threshold.
- No expected answer appears in provider logic.
- Noisy, ambiguous, and compound cases are represented.

## Evidence Contract

Commit before/after skill text, raw eval results, and `evidence/skill-eval.md` with model, configuration, sample count, metrics, confusion cases, known limitations, and adoption decision.

## Incomplete When

A hand-maintained JSON catalog replaces real metadata, only deterministic token scoring is reported, the model is unrecorded, expected answers are embedded in selection code, or ambiguity cannot abstain.

## Evaluation Rubric

See [Skill Trigger Eval Harness](../../docs/EVALUATION_RUBRICS.md#skill-trigger-eval-harness).
