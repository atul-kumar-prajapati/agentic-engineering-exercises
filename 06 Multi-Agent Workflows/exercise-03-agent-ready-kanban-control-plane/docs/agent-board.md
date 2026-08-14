# Agent Board Seed

The canonical structured board is [agent-board.json](./agent-board.json). The application copy must remain identical.

| Card | Seed state | Unsafe condition |
|---|---|---|
| ESC-118 | needs-info | Holds `workflowApi.ts` without a reproduction. |
| ESC-120 | ready-for-agent | Correctly reserves the inherited-severity lane. |
| ESC-122 | blocked | Illegally reserves `scoring.ts` while waiting. |
| ESC-121 | cancelled | Still reserves `exportApi.ts` after cancellation. |

The final board keeps unsafe work visible, marks ESC-120 merged, releases every reservation, and records the full transition history.
