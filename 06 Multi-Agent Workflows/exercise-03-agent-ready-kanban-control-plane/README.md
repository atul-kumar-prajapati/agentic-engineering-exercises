# Exercise 03 : Agent Kanban Collision Control

## Your Mission

Your team's coding agents can start unclear, conflicting, or cancelled work because the Kanban board and ownership records disagree. Your mission is to repair the control plane and safely complete only the one card that is truly agent-ready.

The seeded board has an unready card holding a path, two cards reserving `scoring.ts`, and a cancelled card that still owns a file. Assigning agents from this state can overwrite work or expose unsafe data.

Prove that readiness, ownership, review, integration, and board state remain consistent from assignment to merge.

The duration for this challenge is 45 min or less.

## Project

[kanban-control-app](./kanban-control-app) contains the incident queue, invalid board seed, and protected checks. [Incoming issues](./docs/incoming-issues.md), the [card schema](./docs/card-schema.md), and [ownership rules](./docs/ownership-map.md) define the control policy.

Only the inherited-severity card is ready for implementation. The unanswered product rule on ESC-122 must not be invented.

## How To Go About It

1. Record one clean base SHA and the invalid control-plane state in `evidence/before.md` and `evidence/before.patch`.

2. Validate every card before assignment. Release reservations held by needs-info, blocked, or cancelled cards and resolve every ownership collision without deleting terminal history.

3. Create one isolated lane branch from the base SHA for ESC-120. Give the agent only that card, its three owned path prefixes, and `npm run feature:verify`.

4. The lane must add a regression test, stay inside its owned paths, pass the focused command, and create one inspectable commit. It must not edit boards, ownership records, integration logs, or evidence.

5. As integration owner, review the exact commit and merge it with `--no-ff` into an integration branch. Then update both JSON boards, the Markdown board, ownership map, integration log, and evidence.

6. Keep ESC-118 in needs-info, ESC-122 blocked without a reservation, ESC-121 cancelled, and ESC-120 merged with released paths. Save the final state in `evidence/after.md` and `evidence/after.patch`.

7. Run the feature and control-plane checks and raise a focused PR from the integration branch.

## Evidence

Submit:

- The ESC-120 implementation and lane-owned regression test.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/control-plane.json`, `evidence/completed-lane.md`, and captured feature and board outputs.
- Updated board mirrors, ownership map, and integration log.
- `evidence/comparison.md` with collisions, assignments, history, and final state.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, ESC-120 behavior, lane ownership, Git history, board consistency, reservations, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Unsafe cards are not assigned and no ownership reservation overlaps.
- ESC-120 has one lane commit whose parent is the recorded base and whose changes stay inside owned paths.
- An inspectable `--no-ff` merge preserves the accepted lane content.
- Every board mirror and ownership record agrees on the required final card states and released paths.
- `npm run verify:exercise` passes and the submitted evidence matches the Git repository.
