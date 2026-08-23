# Exercise 03 : Code Review Skill Hardening

## Your Mission

Your team gets inconsistent code reviews. Fresh agents miss important regressions, raise false blockers, and produce findings that cannot be reproduced.

Your mission is to improve a reusable code-review skill and prove that it helps fresh agents find real defects without blocking a safe change.

The challenge runs with any coding agent and does not require an API key or paid model call.

The duration for this challenge is 60 min or less.

## Project

[regression-review-app](./regression-review-app) contains three protected review cases, a starter skill, a local scorer, and the verification harness. The [skill contract](./docs/skill-contract.md) defines the reusable workflow and the [evaluation contract](./docs/evaluation-contract.md) defines comparable runs.

## How To Go About It

1. Create two branches from the same starting commit. On the first branch, run one fresh agent session per case without exposing the skill. Use `npm run eval:run` with a small adapter for your agent so the protected runner supplies the exact prompt and captures the uncorrected response.

2. Review the baseline misses and false blockers. Improve `regression-review-app/skills/regression-review/SKILL.md`. Add references or scripts only when they make the workflow reusable; do not add case IDs, expected answers, file hints, or exact diff text.

3. Commit the skill as a focused implementation commit. On the second branch, run new sessions through the same adapter with the skill available. Use the same agent, model, tools, permissions, and time limit as the baseline.

4. The runner writes one prompt, structured run, and nonce-bound transcript per case under `evidence/`. Do not edit, correct, retry, or selectively replace a weak run.

5. Run `npm run eval:score`. Inspect historical coverage, security coverage, precision, clean-control behavior, and regressions. Adopt the skill only when every protected gate passes.

6. Add `before.md`, `before.patch`, `after.md`, `after.patch`, comparison, scorecard, and command proof in an evidence-only commit. Raise the final PR from the skill branch.

## Evidence

Submit:

- The improved `SKILL.md` and any supporting files inside the skill folder.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Six runner-generated prompts, run JSON files, and nonce-bound transcripts.
- `evidence/scorecard.json`, `evidence/review-eval.md`, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the skill and evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and repository [submission standard](../../docs/SUBMISSION_STANDARD.md). No external model provider, network call, Promptfoo installation, or API key is part of verification.

## Completion Criteria

The challenge is complete when:

- Baseline and skill-assisted runs come from the protected runner with matching conditions, unique nonces, and baseline sessions captured at the recorded starting commit.
- Every raw finding is bound to a transcript and protected diff digest.
- The skill covers every violated acceptance rule in the seeded diffs, keeps precision, and does not create a blocker for the conforming control.
- The skill contains a reusable review method, not benchmark answers.
- `npm run verify:exercise` passes, and a reviewer can test the unchanged skill on a different diff.
