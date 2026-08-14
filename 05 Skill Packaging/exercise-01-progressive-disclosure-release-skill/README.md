# Exercise 01 : Progressive Disclosure Release Skill

## Your Mission

Your team produces unreliable release notes from one large prompt that loads every rule and example for every request. Your mission is to package a reusable Agent Skill that selects only the needed guidance and extracts release facts deterministically from Git.

The supplied draft triggers for unrelated work, publishes an internal refactor, misses a breaking migration, and treats missing evidence as passed. The real Git bundle contains customer, breaking, and internal-only changes.

Build the skill, then prove whether it improves the same agent's release notes while using less irrelevant context.

The duration for this challenge is 45 min or less.

## Project

[release-notes-app](./release-notes-app) contains the skill, extractor, output, and evidence checks. [release-history.bundle](./fixtures/release-history.bundle) and the files under [docs](./docs) are protected inputs.

Use this request in both agent sessions:

> Create customer release notes for `exercise-base..origin/exercise-head`. Trace every published item to Git, identify breaking and migration impact, report missing verification evidence, and exclude internal-only work.

Materialize the protected bundle with `npm run fixture:materialize -- <target-directory>` before each run.

## How To Go About It

1. Create two branches from the same starting commit and materialize identical fixture repositories. The second branch must not contain the output produced in the first branch.

2. In the first branch, start a fresh agent session with the monolithic draft but without your packaged skill. Give it the request exactly as written. Do not provide hints, corrections, or retries. Save the output, `evidence/before.md`, and `evidence/before.patch`.

3. Install the official [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) and follow the [Agent Skills specification](https://agentskills.io/specification). Review the first result, release policy, fixture, and eval scenarios.

4. In the second branch, create `.agents/skills/release-notes/` with a concise `SKILL.md`, focused publication, evidence, and migration references, one reusable `scripts/extract-release.mjs`, quality evals, and trigger-boundary evals.

5. Start a fresh session with the skill enabled. Use the same agent, model, tools, permissions, request, repository state, time limit, and first-attempt condition. Do not provide hints, corrections, or retries.

6. Run the full, hotfix-only, and internal-only scenarios. Record the resources actually read and their exact UTF-8 byte totals using `npm run context:measure -- <files>`. Prove unrelated references were not loaded. Record provider token usage too when your agent exposes it, but token telemetry is not required. The extractor must work with arbitrary repositories and Git ranges without fixture answers embedded in it.

7. Save the outputs, before-and-after evidence, resource usage, eval results, and comparison. Raise the final PR only from the second branch.

## Evidence

Submit:

- The complete `.agents/skills/release-notes/` package.
- `evidence/before.md`, `evidence/before.patch`, and `evidence/before-output.md`.
- `evidence/after.md`, `evidence/after.patch`, and `evidence/after-output.md`.
- Hotfix and internal-only outputs, the skill record, byte-measured `resource-usage.json`, `eval-results.json`, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, skill structure, deterministic extraction, release accuracy, selective resource use, eval results, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both runs use identical conditions except the packaged skill.
- The skill has valid metadata, concise main instructions, clear trigger boundaries, and focused resources loaded only when needed.
- The extractor accepts arbitrary repositories and ranges without hard-coded fixture answers.
- Final notes trace both customer changes, identify breaking migration and missing evidence, and exclude internal telemetry.
- Hotfix and internal-only runs avoid unrelated context, and the comparison proves the exact context-byte change without reducing quality.
- `npm run verify:exercise` passes and all required proof is present.
