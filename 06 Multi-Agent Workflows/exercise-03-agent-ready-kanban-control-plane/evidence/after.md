# After: Integrated Kanban Control Plane

- Base SHA: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Lane commit: `f9ca1b9a7f2c62c1a8f476b533ed5a26b4cc6c55`
- Merge commit: `d47a1a7de5152336f40f1b55a37d7d0fef57586a`
- Control commit: `86fbc95fa7f6526f72b83ac45fd2e26faf95ff2c`
- Lane result: `npm run feature:verify` passed 2 files and 5 tests.
- Board result: `npm run board:verify` passed both mirrors, histories, blockers, releases, ownership records, and integration records.
- Protected inputs: the independent reviewer reported all 19 protected inputs intact.

## Final state

| Card | Final state | Reservation | Result |
|---|---|---|---|
| ESC-118 | needs-info | released | Still blocked by `REPRO-118`; unassigned. |
| ESC-120 | merged | released | Inherited Critical severity is preserved in scoring and the rendered badge. |
| ESC-122 | blocked | released | Still blocked only by `RULE-ESC-122`; no product rule invented. |
| ESC-121 | cancelled | released | Unsafe fixture was not used; cancellation history retained. |

Changed product/control files: 8 total before evidence (`scoring.ts`, `SeverityBadge.tsx`, one lane regression test, two board mirrors, and three control documents). The lane changed 61 insertions and 3 deletions; the control commit changed 43 insertions and 38 deletions. `evidence/after.patch` is the genuine base-to-control Git diff.

Remaining risk: a future new severity value must be added to the exhaustive rank map before it can typecheck.
