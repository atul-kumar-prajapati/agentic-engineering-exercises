# Exercise 03 : Skill Benchmark and Package Gate

## Your Mission

Your team is ready to distribute an Agent Skill without proof that it improves real work. Your mission is to benchmark the exact skill package against no-skill and unchanged-starter baselines, then distribute it only if it passes a measurable gate.

The supplied `incident-summary` skill produces polished reports but loses attribution, turns assumptions into facts, closes unfinished actions, and may add cost without improving quality.

Run a fair three-lane benchmark, improve the skill from training failures, and prove the packaged archive is the exact version that passed.

The duration for this challenge is 60 min or less.

## Project

[skill-benchmark-app](./skill-benchmark-app) contains four protected incident tasks, the weak starter skill, deterministic grading, aggregation, and package verification. Read the [source rules](./docs/incident-sources.md) and [benchmark gate](./docs/benchmark-gate.md).

## How To Go About It

1. Install the official [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator). Record its source commit and installed file hash.

2. Run every incident task three times in each condition: `without_skill`, `starter_skill`, and `with_skill`. Keep the agent, model, tools, permissions, prompt, repository commit, time limit, and first-attempt condition identical.

3. Before changing the skill, save the no-skill and starter outputs, timing records, grades, `evidence/before.md`, and `evidence/before.patch`.

4. Improve `skills/incident-summary/` only from training failures. Do not copy fixture answers or held-out wording into the skill.

5. Run the improved lane under the same conditions. Save every output, timing record, generated grade, `evidence/after.md`, and `evidence/after.patch`. Do not selectively rerun failures.

6. Compare quality, critical failures, variance, tokens, and elapsed time. Use held-out results only for the final adoption decision.

7. Package the skill only after the benchmark gate passes. Verify the archive contains the exact evaluated skill tree, then raise the final PR.

## Evidence

Submit:

- The improved `skills/incident-summary/` package.
- `benchmark-workspace/` with all 36 outputs, timing files, and generated grades.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/benchmark.json`, `evidence/benchmark.md`, `evidence/analysis.md`, `evidence/skill-record.md`, and `evidence/comparison.md`.
- `evidence/package-manifest.json` and `dist/incident-summary.skill`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, skill structure, complete benchmark runs, deterministic grades, quality and cost gates, package identity, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- All 36 first-attempt runs use matching conditions and contain measured timing, token, output, and grading data.
- The improved skill passes at least 87.5 percent of held-out assertions and every critical held-out assertion.
- Held-out quality improves by at least 10 percentage points over both baselines without excessive variance, token use, or elapsed time.
- The archive contains the exact evaluated skill files and no fixture answers leak into the package.
- `npm run verify:exercise` passes and the final PR contains all required benchmark and packaging proof.
