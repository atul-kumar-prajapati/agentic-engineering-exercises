# Completed ESC-120 Lane

- Base SHA: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Lane commit: `f9ca1b9a7f2c62c1a8f476b533ed5a26b4cc6c55`
- Agent: `severity-agent` (`/root/esc120_lane`)
- Reviewer: `risk-owner` (`/root/risk_review`)
- Owned paths: `src/utils/scoring.ts`, `src/components/SeverityBadge.tsx`, and `tests/esc-120/`
- Changed paths: `src/utils/scoring.ts`, `src/components/SeverityBadge.tsx`, and `tests/esc-120/inherited-severity.test.tsx`
- Feature command: `npm run feature:verify` passed 2 test files and 5 tests at the exact lane commit.
- Reviewer decision: accept. The sole parent, fixed ownership boundary, monotonic severity behavior, rendered badge, protected-input integrity, and focused result were independently checked.
- Findings: no High, Medium, or Low defects. Inherited severity is selected only when higher, so it cannot downgrade declared severity.
- Merge commit: `d47a1a7de5152336f40f1b55a37d7d0fef57586a`; the reviewed blobs were preserved by the no-ff merge.
- Rollback: `git revert d47a1a7de5152336f40f1b55a37d7d0fef57586a`
- Remaining risk: the explicit rank map must be updated if the `Severity` union expands; full repository-quality checks remain the integration owner's responsibility.
