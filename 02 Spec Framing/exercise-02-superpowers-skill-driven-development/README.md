# Exercise 02 : Superpowers Skill-Driven Development

## Your Mission

Your team is implementing features too quickly from incomplete plans, causing permission bugs and repeated rework. Your mission is to use a skill-driven development workflow to design, test, implement, review, and verify a complete team-invitation lifecycle.

The repository has team roles and workspace policies but no safe invitation workflow. The change crosses authorization, duplicate prevention, guest policy, expiry, acceptance, revocation, state mutation, UI, and tests.

Use Superpowers, then prove whether its structured workflow improves the same agent's first-attempt result.

The duration for this challenge is 60 min or less.

## Project

[team-collaboration-app](./team-collaboration-app) is a workspace application with existing membership rules, support incidents, and an unsafe legacy invitation helper.

Use this production change in both agent sessions:

> Add a Team Invitations section. An active owner or admin allowed by the workspace policy may invite an email as a member or guest. Guest invitations are allowed only when the workspace policy permits them. Prevent invitations for existing members or an email with a pending invitation. Invitations must use the configured expiry period and may be accepted or revoked only once. Rejected actions must not change invitation or member data.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without Superpowers. Give it the production change exactly as written. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Install [Superpowers](https://github.com/obra/superpowers) using the instructions for your coding agent. Review the first implementation, repository rules, support incidents, and the [invitation contract](./docs/invitation-contract.md).

4. In the second branch, start a fresh session with Superpowers enabled. Give it the same request using the same agent, model, tools, permissions, and time limit.

5. Follow the skill workflow in order: approve the design, create the implementation plan, record a failing test before production code changes, execute the plan, request code review, resolve the findings, and run final verification. Keep the design and plan in the locations produced by Superpowers.

6. Do not provide implementation hints, corrections, or retries. Keep the first implementation produced by this session and record the exact skills and artifacts used.

7. Save `evidence/after.md`, `evidence/after.patch`, `evidence/skill-usage.md`, `evidence/tdd.md`, `evidence/review.md`, and `evidence/comparison.md`. Raise the final PR only from the second branch.

## Evidence

Submit:

- The Team Invitations feature and automated tests.
- The approved Superpowers design and implementation plan.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/skill-usage.md`, `evidence/tdd.md`, and `evidence/review.md`.
- `evidence/comparison.md` comparing at least four invitation risks and the final results.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, invitation behavior, workflow order, skill artifacts, review proof, and the before-and-after evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both sessions use the same production change and working conditions.
- The second run proves design, planning, failing tests, implementation, review, and verification occurred in that order.
- The feature enforces invitation permissions, guest policy, normalized duplicate checks, configured expiry, and single-use acceptance and revocation.
- Rejected actions leave invitation and member state unchanged, and the UI uses the shared service.
- `npm run verify:exercise` passes and the final PR contains all required artifacts and evidence.
