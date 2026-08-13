# Exercise 01 : Parallel Worktree Conflict Rescue

## Your Mission

Your mission is to deliver three related product changes through parallel agent lanes without losing work or allowing agents to edit the same shared file.

You are given saved-filter, SLA-risk, and evidence-export tasks. Two lanes need changes to `src/types.ts`, but neither lane owns that file. A careless parallel run will create conflicting commits or hide an incomplete lane.

Use isolated Git worktrees, preserve every lane commit, and integrate the shared type requests once through an integration owner.

The duration for this challenge is 30 min or less.

## Project

[worktree-feature-app](./worktree-feature-app) contains the application. [task board](./docs/task-board.md) defines the three fixed lanes, ownership boundaries, focused checks, and integration order.

## How To Go About It

Record one base SHA and create one branch and worktree per lane. Give each agent only its task, owned paths, and focused command.

Each lane must commit its work and hand off its result without editing `src/types.ts`. The integration owner reviews the three commits, applies both shared-type requests in one commit, and records any rejected or blocked work.

## Evidence

Submit the completed feature work, `evidence/lane-handoffs.json`, `evidence/worktree-log.md`, `evidence/integration.md`, and focused output for every lane.

Run `npm run lanes:verify`, `npm run test:submission`, and `npm run agent:check` from `worktree-feature-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will verify that all lanes share one base SHA, remain within their ownership boundaries, preserve inspectable commits, and pass focused checks. The shared file must be changed only by the integration owner.

The exercise is incomplete if lane history is missing, agents edit the same shared file independently, a blocked lane is presented as complete, or the final integrated check fails.

See the [Parallel Worktree Conflict Rescue rubric](../../docs/EVALUATION_RUBRICS.md#parallel-worktree-conflict-rescue).
