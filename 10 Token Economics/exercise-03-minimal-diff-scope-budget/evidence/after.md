# After: budgeted first attempt

## Session conditions

Matched to the before run except for the independent variable (the committed scope plan):

- Agent/tool: Cursor
- Model slug: `cursor-grok-4.6-high` (subagent [Budgeted export migration](e37f16fa-954d-464d-b273-65175bdc19f3); parent integration owner Cursor Grok 4.6)
- Worktree: `/tmp/ex-10-03-after`
- Branch: `codex/exercise-10-03-minimal-diff-scope-budget-after`
- Starting SHA: `c035329dd23f040f3afd55e1ffd56e9c3904729b` (plan commit already on the branch)
- Tools: Read, Write, Shell, Glob, Grep
- Permissions: worktree write under `/tmp/ex-10-03-after`; no commit, no push
- Time limit: exercise duration 30 minutes; single first attempt, no retry
- Extra input: `evidence/scope-plan.json`, `evidence/scope-plan.md`, `docs/scope-contract.md`, `scripts/run-migration-tests.mjs`, learner-test substring requirements from `submission-contract.json`

The after run received those artifacts only. It did not receive the previous implementation, before.patch, or any explanation of the first attempt.

## Actual scope

Re-derived from `git diff --numstat HEAD` in the after worktree, then from `git show --format= --numstat 71703feac67672c41321f517effd752ef60d0493` after the source commit. Both sums are 2 files, 39 additions, 1 deletion, 40 changed lines.

| File | + | − |
|---|---:|---:|
| `minimal-diff-app/src/migration/exportButton.mjs` | 1 | 1 |
| `minimal-diff-app/tests/export-button.test.mjs` | 38 | 0 |

Blob IDs of the unaided after files match the source commit: helper `f2da70a67c627c3bbd4033c5ccfbc58c3ae3da92`, test `5eec6fb7613fe899041978cc8f60cd9cd6ec7c5d`. Integration did not replace those blobs. `after.patch` is that unaided diff.

## Behavior

`buttonVariantFor("export")` returns `ds-secondary`. Checkout, unknown, archive, save, and empty string return `legacy-primary`. Delete returns `legacy-danger`.

## Checks

From the after worktree app directory:

- `node ./scripts/run-migration-tests.mjs` → exit code: 0
- `node ./tests/export-button.test.mjs` → exit code: 0
