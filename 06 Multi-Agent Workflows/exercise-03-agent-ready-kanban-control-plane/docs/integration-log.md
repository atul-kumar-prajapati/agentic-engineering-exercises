# Integration Log

- Base SHA: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` from `upstream/main`.
- Lane commit: `f9ca1b9a7f2c62c1a8f476b533ed5a26b4cc6c55` on `lane/esc-120-inherited-severity`.
- Reviewer: `risk-owner`; decision: accept the exact lane commit after scope, protected-input, behavior, and feature command review.
- Feature command: `npm run feature:verify` passed 2 files and 5 tests at the reviewed lane SHA.
- Merge commit: `d47a1a7de5152336f40f1b55a37d7d0fef57586a`, created with `--no-ff` from the recorded base.
- Reservation releases: ESC-118 released `workflowApi.ts`; ESC-121 released `exportApi.ts`; ESC-122 released the colliding scoring path; ESC-120 released all lane paths after merge.
- Remaining blocker: ESC-122 is still blocked only by `RULE-ESC-122`; no product rule was invented.
- Board command: `npm run board:verify` is required against the following control commit and its captured output is recorded in evidence.
- Final decision: accept ESC-120 and leave ESC-118, ESC-121, and ESC-122 unassigned in their evidence-backed states.
- Rollback order: revert merge commit `d47a1a7de5152336f40f1b55a37d7d0fef57586a`; then restore the pre-integration control records if rollback is approved.
