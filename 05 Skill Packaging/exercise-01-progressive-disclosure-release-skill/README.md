# Exercise 01 : Progressive Disclosure Release Skill

## Your Mission

Your mission is to turn a long release-note prompt into a reusable Agent Skill that loads only the context needed for the current task.

You are given a real Git bundle, scattered release rules, and a monolithic skill draft that mixes trigger guidance, policy, examples, and deterministic extraction steps. It is expensive to load and easy to apply incorrectly.

Use the Agent Skills structure to create a concise `SKILL.md`, move detailed policy to references, and put repeatable Git extraction in a script.

Prove that the packaged skill produces better release notes than the original raw prompt.

The duration for this challenge is 30 min or less.

## Project

[release-notes-app](./release-notes-app) contains the verifier. [release-history.bundle](./fixtures/release-history.bundle) and the files under [docs](./docs) are protected source inputs.

## How To Go About It

Install the official [skill-creator skill](https://github.com/anthropics/skills/tree/main/skills/skill-creator) and follow the [Agent Skills specification](https://agentskills.io/specification).

Run the release request once without the new skill and save the first result. Then create `.agents/skills/release-notes/` with a focused `SKILL.md`, `references/`, `scripts/`, and `evals/evals.json`.

Start a fresh agent with the skill enabled and the same conditions. The skill must inspect the real Git range, trace published claims, flag the breaking change and missing evidence, and exclude internal telemetry.

## Evidence

Submit the complete skill folder, generated notes, `evidence/before.md`, `evidence/before-output.md`, `evidence/after.md`, `evidence/after-output.md`, and `evidence/comparison.md`.

Run `npm run fixture:smoke`, `npm run skill:validate`, `npm run release:verify -- <cloned-fixture-path> <release-notes.md>`, `npm run test:submission`, and `npm run agent:check` from `release-notes-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check valid metadata, precise trigger boundaries, progressive disclosure, linked references, a reusable extraction script, realistic evals, and a fair before-and-after run.

The final notes must be derived from Git, trace every customer-facing item, flag breaking and missing-evidence work, and exclude internal-only changes.

The exercise is incomplete if the skill is one large prompt, resources are duplicated, expected notes are hard-coded, protected inputs are changed, or required checks fail.

See the [Progressive Disclosure Release Skill rubric](../../docs/EVALUATION_RUBRICS.md#progressive-disclosure-release-skill).
