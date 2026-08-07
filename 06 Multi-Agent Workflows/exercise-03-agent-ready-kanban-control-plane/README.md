# Exercise 03: Agent-Ready Kanban Control Plane

## Objective

Use a structured Kanban control plane to decide what can run, what must wait, and what must be cancelled before completing one safe lane.

## Starting Point

The board contains a needs-info card, two cards that collide on `scoring.ts`, and a cancelled export lane. The canonical docs board is mirrored in application data, with ownership and integration logs.

## Required Implementation Changes

- Validate every card against `docs/card-schema.md`.
- Keep ESC-122 blocked while ESC-120 owns `scoring.ts`.
- Preserve the reason ESC-121 was cancelled and ensure it owns no paths.
- Complete one ready card with an isolated branch, focused command, review, and integration decision.
- Update board state/history, app data, ownership map, and integration log together.

## Allowed Changes

Change control-plane documents/data, the selected card's reserved paths and tests, and evidence. Do not implement needs-info, blocked, or cancelled cards without first recording a valid state transition and ownership release.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `kanban-control-app`:

```text
npm ci
npm run board:verify
npm run agent:check
```

Run the selected card's focused verification command before integration.

## Acceptance Criteria

- Required card fields are complete.
- Collision decisions are visible and consistent.
- At least one failed, rejected, or cancelled lane remains evidenced.
- One valid lane has an inspectable commit and decision.
- Markdown board, JSON board, application data, ownership map, and integration log agree.

## Evidence Contract

Commit the updated control-plane artifacts and `evidence/completed-lane.md` with base/commit SHA, reserved paths, command output, reviewer, merge/reject decision, and rollback.

## Incomplete When

Cards are only prose, conflicting lanes run together, terminal lanes disappear from history, states differ across artifacts, or successful integration is shown without explaining blocked/cancelled work.

## Evaluation Rubric

See [Agent-Ready Kanban](../../docs/EVALUATION_RUBRICS.md#agent-ready-kanban).
