# Final Agent Board

The canonical structured board is [agent-board.json](./agent-board.json), and the application mirror is synchronized with it. There are no active reservations after integration.

| Card | Final state | Assignment and control decision |
|---|---|---|
| ESC-118 | needs-info | Unassigned. `REPRO-118` is still required, so `workflowApi.ts` was released. |
| ESC-120 | merged | The severity-agent lane passed review and verification; its three owned paths were released after the no-ff merge. |
| ESC-122 | blocked | Unassigned. The shared paths were released and `RULE-ESC-122` remains the only blocker. |
| ESC-121 | cancelled | Unassigned. `exportApi.ts` was released while the cancellation and unsafe-fixture history remain visible. |

ESC-120 retains its full `incoming` → `triaged` → `ready-for-agent` → `in-progress` → `in-review` → `merged` history. The other cards retain their original terminal or waiting histories without being reopened.
