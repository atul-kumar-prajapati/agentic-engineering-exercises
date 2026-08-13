# Exercise 03 : Agent Kanban Collision Control

## Your Mission

Your mission is to operate a Kanban control plane that prevents agents from starting unclear, conflicting, or cancelled work.

You are given one needs-information card, two cards that compete for `scoring.ts`, and a cancelled export lane. Starting every card in parallel will violate ownership and produce an invalid board history.

Keep unsafe work blocked, complete one ready lane in isolation, and update every board and ownership artifact consistently.

The duration for this challenge is 30 min or less.

## Project

[kanban-control-app](./kanban-control-app) renders the canonical board. [incoming issues](./docs/incoming-issues.md), [card schema](./docs/card-schema.md), and the ownership map define the control rules.

## How To Go About It

Validate every card before assignment. Reserve paths before starting work, keep the collision visible, and preserve the cancellation reason and state history.

Complete one ready card on an isolated branch with a focused command and reviewer decision. Synchronize the Markdown board, JSON board, application data, ownership map, and integration log.

## Evidence

Submit the updated control-plane artifacts and `evidence/completed-lane.md` containing base and commit SHA, reserved paths, command output, reviewer, integration decision, and rollback.

Run `npm run board:verify`, `npm run test:submission`, and `npm run agent:check` from `kanban-control-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will verify schema completeness, valid state transitions, exclusive path ownership, one inspectable completed lane, and consistent board mirrors. Blocked and cancelled work must remain visible.

The exercise is incomplete if conflicting cards run together, terminal lanes disappear, state differs between artifacts, or a lane is integrated without evidence.

See the [Agent Kanban Collision Control rubric](../../docs/EVALUATION_RUBRICS.md#agent-kanban-collision-control).
