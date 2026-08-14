# Exercise 03 : Verification Skill Workflow Gate

## Your Mission

Your team approved a release from one focused green test even though the client, provider, and workflow boundary still fail. Your mission is to replace the unsupported completion claim with one fresh, fail-closed full-stack verification command.

The React client accepts an invalid response, the Spring API omits a required decision state, an unsupported transition is persisted, and the existing gate checks only the easiest path.

Use the Verification Before Completion skill, then prove whether claim-first verification improves the same agent's first result.

The duration for this challenge is 45 min or less.

## Project

[workflow-gate-app](./workflow-gate-app) contains the React client and protected client checks. [workflow-rules-api](./workflow-rules-api) contains the Spring API and protected provider checks.

Use this production request in both agent sessions:

> Audit the previous release claim, repair the workflow decision boundary, and create one fail-closed command that proves the client contract, client build, complete provider behavior, provider build, and gate failure handling.

Run the previous focused command before editing. It is expected to pass and does not prove the release.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without the Verification Before Completion skill. Give it the request exactly as written. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Install the [Verification Before Completion skill](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion). Audit the previous claim and map every [release requirement](./docs/release-requirements.md) to a command and observable result before editing.

4. In the second branch, start a fresh session with the skill using the same agent, model, other tools, permissions, time limit, and first-attempt condition.

5. Repair runtime client validation, provider response state, unsupported transition handling, and `scripts/verification-gate.mjs`. The gate must run each required surface once, stop at the first command or spawn failure, preserve the non-zero exit code, and use committed wrappers and lockfiles.

6. Prove the gate's success, non-zero failure, and spawn-error behavior with the protected contract check. From a clean implementation state, run the complete gate once and report only what that fresh output proves.

7. Save `evidence/after.md`, `evidence/after.patch`, `evidence/skill-record.md`, `evidence/claim-audit.md`, `evidence/verification-plan.md`, `evidence/gate-contract.txt`, `evidence/final-verification.txt`, and `evidence/comparison.md`. Raise the PR from the second branch.

## Evidence

Submit:

- The repaired client boundary, provider rules, regression tests, and release gate.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- The skill record, claim audit, verification plan, gate contract, final verification output, and comparison.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, client and provider behavior, fail-closed gate behavior, fresh command proof, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both sessions use the same request and working conditions except the verification skill.
- The client rejects missing or unknown states, the provider derives every required state, and unsupported transitions are not persisted.
- One release command covers the gate contract, client contract and build, complete provider behavior, and provider build.
- The gate stops on its first failure, returns non-zero, and the final claim uses fresh output from the completed implementation.
- `npm run verify:exercise` passes and the final PR contains all required proof.
