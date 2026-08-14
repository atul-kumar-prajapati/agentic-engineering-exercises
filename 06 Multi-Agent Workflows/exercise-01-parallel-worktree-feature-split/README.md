# Exercise 01 : Parallel Worktree Conflict Rescue

## Your Mission

Your team needs three product changes at the same time, but two changes depend on shared types that no lane owns. Your mission is to coordinate parallel coding agents without overlapping edits, lost commits, or hidden integration conflicts.

Each lane must remain independently testable and request shared changes instead of editing shared ownership. One integration owner must review the real Git history, merge in the required order, and resolve shared types once.

Use real Git worktrees and prove the parallel workflow from base commit to final integration.

The duration for this challenge is 60 min or less.

## Project

[worktree-feature-app](./worktree-feature-app) contains the application and protected acceptance tests. The [task board](./docs/task-board.md), [ownership map](./docs/file-ownership-map.md), and [integration contract](./docs/integration-contract.md) define the three fixed lanes.

## How To Go About It

1. Record one clean base SHA and the initial worktree state in `evidence/before.md` and `evidence/before.patch`.

2. Create three branches from that SHA and attach each one to a real Git worktree. Use the lane tasks from the board; branch names may differ, but the evidence must identify which branch implements each lane.

3. Give each agent only its lane task, owned paths, shared-type request, and focused command. Every lane must add tests, pass its focused check, create one inspectable commit, and submit a handoff without editing `src/types.ts`.

4. Keep the lane branches and worktrees available for review. Capture `git worktree list --porcelain` while all three are linked.

5. As integration owner, verify every handoff against its commit. Merge lanes B, A, and C with `--no-ff`, then create one separate commit that adds the shared types and updates imports.

6. Run the complete acceptance and repository checks. Record the final history and metrics in `evidence/after.md` and `evidence/after.patch`, then remove the linked worktrees and capture the final worktree list.

7. Save all lane, command, integration, and comparison evidence. Raise a focused PR from the integration branch without flattening or rewriting the lane history.

## Evidence

Submit:

- The completed feature work and lane-owned tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/lane-handoffs.json`, `evidence/integration.json`, and `evidence/integration.md`.
- Worktree captures and all four command outputs under `evidence/commands/`.
- `evidence/comparison.md` with lane isolation, conflicts, merge history, and final results.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, every lane, integrated behavior, ownership boundaries, Git history, handoffs, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- All lane commits share the recorded base parent, remain inspectable, match their handoffs, and change only owned paths.
- Every lane includes tests and passes its focused command without editing `src/types.ts`.
- Three `--no-ff` merges preserve B, A, C order and one later commit owns all shared-type changes.
- Worktree and command evidence match the Git repository, and linked worktrees are cleaned up only after verification.
- `npm run verify:exercise` passes and the final PR preserves the required history and proof.
