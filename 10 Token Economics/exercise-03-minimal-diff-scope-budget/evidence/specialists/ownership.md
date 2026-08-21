# Specialist ownership

Parent integration owner: Cursor Grok 4.6. Every specialist launched with model slug `cursor-grok-4.6-high`. All three lanes were parallel and read-only: they must not create, edit, or delete files, and must not run mutating Git commands. Only the integration owner writes.

| Lane | Subagent | Scope | Out of bounds | Verification command | Output | Write permission |
|---|---|---|---|---|---|---|
| Scope / diff budget | [Scope-diff specialist review](9f7f9945-21c9-45a7-8512-080af9f74e98) | Before vs after path sets, excluded paths, numstat totals, unrelated cleanup inside the helper | Variant return values; plan-before-code ancestry | `git diff --numstat` on `/tmp/ex-10-03-before` vs `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` and `/tmp/ex-10-03-after` vs `HEAD` | Verdict plus per-finding table with file:line on a named tree | none |
| Behavior preservation | [Behavior-preservation specialist](70bacb51-3b8d-4203-94b5-cb20093170eb) | `buttonVariantFor` for export, checkout, delete, unknown, archive, save, empty string | Git history, numstat, evidence files | `node ./scripts/run-migration-tests.mjs` and `node ./tests/export-button.test.mjs` in the after app | Per-case expected/actual/file:line | none |
| Evidence / Git integrity | [Evidence-integrity specialist](c6f32b49-38b0-4375-9d4d-fda5bfff401c) | `scope-verification.mjs` constraints, plan commit contents, size floors, hash-cycle probe | Helper variant correctness; whether before was too broad | `git diff-tree --name-only -r c035329dd23f040f3afd55e1ffd56e9c3904729b`; char counts; after numstat | Verdict plus verifier file:line | none |

Citation tree (no Git bundle): helper line numbers are the after working tree / source commit blob; protected behavior lines are `minimal-diff-app/scripts/run-migration-tests.mjs` as checked in on `upstream/main` (identical in every 10.3 worktree); Git constraints are cited from `scripts/scope-verification.mjs` and `scripts/verify-scope-submission.mjs` in that same tree.
