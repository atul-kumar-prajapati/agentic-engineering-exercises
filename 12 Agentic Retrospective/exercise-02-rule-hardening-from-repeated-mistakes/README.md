# Exercise 02 : Repeated Mistake to Repository Rule

## Your Mission

Your mission is to convert repeated agent corrections into a concise repository rule that changes behavior in a fresh session.

You are given correction history showing display labels saved instead of stable IDs, status text stored without normalization, and timestamps created inside business logic. The starter has no enforceable guidance and repeats those mistakes.

Run the proving task once, harden the repository instructions and checks, then run the same task with a fresh agent and compare the first attempts.

The duration for this challenge is 30 min or less.

## Project

[rule-hardening-app](./rule-hardening-app) contains the seeded persistence defect. [correction history](./docs/correction-history.md) and [proving task](./tasks/proving-change.md) are protected inputs.

## How To Go About It

Cluster repeated mistakes and write only rules supported by more than one event. Put minimum safe-start guidance in `AGENTS.md`, route deeper persistence guidance to `.agent/`, and make executable checks enforce objective behavior.

Give a fresh agent the same proving task and conditions. Capture both unedited first attempts before making corrections and explain any rule that did not change behavior.

## Evidence

Submit `AGENTS.md`, the focused `.agent/` guidance, executable check, final fix, `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`.

Run `npm run test:persistence`, `npm run test:submission`, and `npm run agent:check` from `rule-hardening-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check trace-backed rules, minimal safe-start context, deeper routing, executable enforcement, identical first-attempt conditions, and stable-ID, normalized-status, injected-time behavior.

The exercise is incomplete if rules are generic, copied from one isolated mistake, duplicated across files, unsupported by checks, or the after attempt is not fresh.

See the [Repeated Mistake to Repository Rule rubric](../../docs/EVALUATION_RUBRICS.md#repeated-mistake-to-repository-rule).
