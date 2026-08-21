# Evidence-integrity lane handoff

Reviewer: [Evidence-integrity specialist](c6f32b49-38b0-4375-9d4d-fda5bfff401c), model `cursor-grok-4.6-high`, read-only. Integration owner re-ran `git diff-tree` on the plan commit and `git show --numstat` on the source commit before accepting.

Authoritative artifacts: `scripts/scope-verification.mjs` and `scripts/verify-scope-submission.mjs` in the checked-in app (protected; same as `upstream/main`). Git history compares **commits**, not the working tree (`diff-tree -r <sha>`, `show --numstat <sourceSha>`, `diff --name-only sourceSha HEAD`).

| Check | Result | file:line | disposition |
|---|---|---|---|
| planSha file list is exactly the two plan files | pass at `c035329dd23f040f3afd55e1ffd56e9c3904729b` | `scope-verification.mjs:20-22` | **accept** |
| schemaVersion 1, two files, 40 lines, allowed paths, excluded components/styles/package.json | pass | `verify-scope-submission.mjs:14-18` | **accept** |
| After/source path set helper+test, files=2, changedLines=40 | pass (`>` not `>=` at `:27`) | `scope-verification.mjs:23-27` | **accept** |
| Learner test ≥500 chars and seven substrings | pass (`trim` length 1342) | `submission-contract.json` learner-test entry | **accept** |
| Ledger recording ancestor SHAs is not a hash cycle | pass | `scope-verification.mjs:17-18,29-30` | **accept** |
| Unsatisfiable gate | none in this lane | — | **accept** |

Dismissed: capitalized `Excluded` in the plan heading (verifiers lowercase); UTF-8 byte vs JS length on em dashes in `scope-plan.md`; treating 40 as over budget.

Caveat recorded, not a defect: after `sourceSha`, only `evidence/` paths may change. Integration owner committed source as helper+test only, then evidence separately.
