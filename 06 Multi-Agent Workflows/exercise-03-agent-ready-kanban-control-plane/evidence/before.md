# Before: Invalid Kanban Control Plane

- Base branch: `upstream/main`
- Base SHA: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Base merge proof: the exercise branch HEAD and merge base both resolved to the same 40-character SHA before work began.
- Protected inputs: unchanged at assignment time; the manifest defines 19 protected files.

## Invalid card and ownership state

| Card | State | Invalid reservation or readiness condition |
|---|---|---|
| ESC-118 | needs-info | Reserved `src/services/workflowApi.ts` without deterministic reproduction evidence. |
| ESC-120 | ready-for-agent | Correctly reserved its three-path implementation lane and was the only assignable card. |
| ESC-122 | blocked | Reserved `src/utils/scoring.ts`, colliding with ESC-120 while `RULE-ESC-122` was unanswered. |
| ESC-121 | cancelled | Reserved `src/services/exportApi.ts` despite terminal cancellation and unsafe fixture evidence. |

The seeded source also returned only declared severity and the badge bypassed the scoring function. `evidence/before.patch` is the genuine Git diff that introduced the seeded invalid control-plane records on company main.

Decision: assign only ESC-120. Release every waiting, blocked, cancelled, or completed reservation without deleting card history.
