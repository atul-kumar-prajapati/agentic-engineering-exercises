# Exercise 01: Parallel Worktree Feature Split

## Objective

Implement the three supplied product improvements in isolated Git worktrees and integrate them with inspectable handoffs.

## Starting Point

`docs/task-board.md` defines saved filters, SLA risk, and evidence export. `docs/file-ownership-map.md` assigns paths and deliberately makes lanes A and C request changes to shared `src/types.ts`.

## Required Implementation Changes

- Create one branch and worktree per lane from the same recorded base SHA.
- Keep each lane inside its ownership boundary and run its focused check.
- Preserve every lane branch and commit for review.
- Resolve shared type requests in a separate integration-owner commit.
- Integrate in the documented order and run the final application check.

## Allowed Changes

Each lane may change only its owned paths and tests. Only the integration owner may change `src/types.ts`, integration evidence, or resolve cross-lane conflicts.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `worktree-feature-app`:

```text
npm ci
npm run agent:check
npm run lanes:verify
```

Each lane must also record and run the focused command from the task board.

## Acceptance Criteria

- All three product changes satisfy their explicit criteria.
- Handoffs include base SHA, branch, paths, command/result, commit SHA, rollback, and shared-file request.
- Lane commits exist and remain inspectable.
- The ownership map, handoffs, worktree log, and Git history agree.
- The shared conflict is resolved once by the integration owner.

## Evidence Contract

Commit `evidence/lane-handoffs.json`, `evidence/worktree-log.md`, `evidence/integration.md`, focused outputs, and final check output. Use the handoff template.

## Incomplete When

Tasks are replaced with different work, lane commits are unavailable, ownership is violated, the shared file is edited independently in multiple lanes, or only the cherry-picked result is shown.

## Evaluation Rubric

See [Parallel Worktree Feature Split](../../docs/EVALUATION_RUBRICS.md#parallel-worktree-feature-split).
