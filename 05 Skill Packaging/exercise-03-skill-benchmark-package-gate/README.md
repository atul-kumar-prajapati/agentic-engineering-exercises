# Exercise 03 : Skill Benchmark and Package Gate

## Your Mission

Your mission is to decide whether a skill is ready to distribute using measured task quality, not a convincing demo.

You are given an incident-summary skill that produces polished output but misses source attribution, separates facts poorly, and sometimes costs more than the baseline prompt.

Use the skill-creator workflow to run baseline and with-skill evaluations, improve the skill from failures, and package only the version that passes the quality gate.

The duration for this challenge is 30 min or less.

## Project

[skill-benchmark-app](./skill-benchmark-app) contains the skill, realistic eval inputs, assertions, benchmark verifier, and package gate.

## How To Go About It

Install the official [skill-creator skill](https://github.com/anthropics/skills/tree/main/skills/skill-creator).

Run every supplied task without the skill and with the unchanged skill. Grade factual assertions with evidence and record tokens and elapsed time. Improve the skill, then rerun each lane at least three times.

Compare quality, variance, token use, and time. Package the selected skill as a `.skill` archive only after held-out quality passes and no critical assertion regresses.

## Evidence

Submit the improved skill, `evals/evals.json`, raw run folders, `evidence/benchmark.json`, `evidence/benchmark.md`, and `dist/incident-summary.skill`.

Run `npm run eval:fixtures`, `npm run skill:validate`, `npm run test:submission`, and `npm run agent:check` from `skill-benchmark-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check real baseline and with-skill runs, evidence-backed grading, repeated samples, held-out tasks, variance, token and time reporting, and a valid installable package.

The chosen skill must improve required assertions without answer leakage, critical regressions, or unreasonable context cost.

The exercise is incomplete if results are self-declared, only the best run is reported, expected answers are copied into instructions, the archive is invalid, protected inputs are changed, or required checks fail.

See the [Skill Benchmark and Package Gate rubric](../../docs/EVALUATION_RUBRICS.md#skill-benchmark-and-package-gate).
