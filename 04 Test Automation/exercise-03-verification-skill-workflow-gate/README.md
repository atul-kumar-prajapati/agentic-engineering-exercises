# Exercise 03 : Verification Skill Workflow Gate

## Your Mission

Your mission is to stop an agent from declaring a full-stack workflow complete after running only the easiest green test.

You are given a React client and Spring API where unit tests pass, but the release workflow has a response-shape mismatch and an invalid transition can cross the real boundary.

Use the Verification Before Completion skill to define and run one fresh evidence gate for the client, provider, build, and protected release behaviour.

The duration for this challenge is 30 min or less.

## Project

[workflow-gate-app](./workflow-gate-app) and [workflow-rules-api](./workflow-rules-api) contain the client and provider. [release claim](./docs/release-claim.md) contains the previous unsupported completion statement.

## How To Go About It

Install the [Verification Before Completion skill](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion):

```bash
npx skills add https://github.com/obra/superpowers --skill verification-before-completion
```

Run the previous agent's command and record exactly what it proves. Then inspect the release requirements, add the missing cross-boundary checks, fix the real behavior, and make `node scripts/verification-gate.mjs` the single release command.

Do not make a completion claim from old output, a partial command, or expected results. Record the fresh command, exit code, and relevant output.

## Evidence

Submit the tests and fix, `evidence/claim-audit.md`, `evidence/verification-plan.md`, and `evidence/final-verification.txt` from one clean gate run.

Run `node scripts/verification-gate.mjs`, `npm run test:submission`, and `npm run agent:check` from `workflow-gate-app`. The gate must also run the Maven wrapper tests.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that every completion claim is tied to fresh command output and that one gate covers client tests, provider tests, protected behaviour, and both builds.

The final workflow must reject the invalid transition and return the client-required decision state without weakening the client contract.

The exercise is incomplete if only one project is tested, output is copied or summarized without an exit code, the gate ignores a failure, protected inputs are changed, or required checks fail.

See the [Verification Skill Workflow Gate rubric](../../docs/EVALUATION_RUBRICS.md#verification-skill-workflow-gate).
