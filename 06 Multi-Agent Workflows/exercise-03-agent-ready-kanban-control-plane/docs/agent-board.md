# Agent Board Seed

The canonical structured board is [agent-board.json](./agent-board.json). It is mirrored by the application's `src/data/agent-board.json`.

| Card | State | Decision |
|---|---|---|
| ESC-118 | needs-info | Do not assign until reproduction exists. |
| ESC-120 | ready-for-agent | Runs first and owns `scoring.ts`. |
| ESC-122 | blocked | Conflicts with ESC-120 and must wait. |
| ESC-121 | cancelled | Production-like data makes the proposed lane unsafe. |

Completing the exercise requires one card implementation plus a consistent update to both JSON boards, the ownership map, and the integration log.
