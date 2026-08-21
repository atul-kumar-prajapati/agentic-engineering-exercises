# Before: unconstrained first attempt

## Session conditions

- Agent/tool: Cursor
- Model slug: `cursor-grok-4.6-high` (subagent [Unconstrained export migration](a8b55f90-f928-4085-b980-38f9c38604e1); parent integration owner Cursor Grok 4.6)
- Worktree: `/tmp/ex-10-03-before`
- Branch: `codex/exercise-10-03-minimal-diff-scope-budget-before`
- Starting SHA: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Result commit: `5fb2a9ef5b24fb1b327a4f622fd6f79ff557f112`
- Tools: Read, Write, Shell, Glob, Grep
- Permissions: worktree write under `/tmp/ex-10-03-before`; no push
- Time limit: exercise duration 30 minutes; single first attempt, no retry
- Prompt: production change only — map export to `ds-secondary`. No scope plan, no two-file cap, no 40-line budget, no excluded-path list.

## Changed paths

Re-derived from `git diff --name-only 3761a42840cbbc4ee9143ecc914519b4f8c6cc0c HEAD` in the before worktree (2 paths):

- `10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/src/migration/exportButton.mjs`
- `10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/tests/export-button.test.mjs`

## Added-plus-deleted lines

Re-derived from `git diff --numstat 3761a42840cbbc4ee9143ecc914519b4f8c6cc0c HEAD`:

| File | + | − | +/− |
|---|---:|---:|---:|
| `exportButton.mjs` | 2 | 1 | 3 |
| `export-button.test.mjs` | 9 | 0 | 9 |
| **Total** | **11** | **1** | **12** |

The helper rewrote the seeded JSDoc and added the export branch. The test is four compact asserts. No components, styles, or package files changed.

## Behavior

Export maps to `ds-secondary`. Checkout stays `legacy-primary`, delete stays `legacy-danger`, unknown stays `legacy-primary`. The unconstrained session did not change those legacy returns.

## Commands

In `minimal-diff-app` of the before worktree: `npm run test:migration` → exit code: 0 (protected `run-migration-tests.mjs` plus the compact learner test).

This baseline is already inside the numeric budget. What it cannot enforce is recorded in `comparison.md`.
