# Evidence / history integrity handoff

Reviewer: `cursor-grok-4.6-high` (read-only). Citation tree: Git objects in `/tmp/ex-10-01` and `token-budget-app/scripts/context-verification.mjs` on disk. Verifier uses `git diff-tree` on named SHAs and `git diff --name-only sourceSha HEAD` (HEAD, not the dirty tree). No bundle.

**Verdict (reviewer): PASS-WITH-GAPS** at review time (ledger untracked, HEAD == sourceSha). After the evidence-only commit this gap is intended to close. Integration: **accept** the history and ledger binding. Independently: `verifyContextEvidence` fields match; `npm run context:verify` exit 0.

## Constraints

| Constraint | File:line | Actual |
|---|---|---|
| planSha ancestor of sourceSha | `context-verification.mjs:26` | `8d94b4c9daa55fecba34f36c9b643aec78ec803a` is parent of `bb581c4941be75cebb31d57d7247e20efc192d20` |
| sourceSha ancestor of HEAD | `:27` | true |
| plan commit only two plan files | `:29-31` | `evidence/context-plan.json`, `evidence/context-plan.md` |
| source commit only selector + learner test | `:33-35` | `src/budget/selectContext.mjs`, `tests/context-selector.test.mjs` |
| later commits evidence-only | `:36-37` | required after the evidence commit |
| SHAs 40-char hex | `:11` | both full |
| ledger task/maximum match plan | `:12` | `{ tags, questionTags }`, 1700 |
| result JSON-equals selector | `:13-15` | all seven fields match, including item objects |
| every catalog id once | `:16-18` | six ids |

## Findings

None in the commits. The reviewer's "uncommitted ledger" gap is the 7.1/8.2 shape: ledger is written after `sourceSha` and committed in the evidence-only follow-up.

## Dismissed

1. **Extra files in planSha or sourceSha.** Dismiss. `diff-tree --name-only` lists exactly the two required paths each.
2. **Truncated SHAs.** Dismiss. Both 40-char lowercase hex and resolve.
3. **Ledger not unmodified selector output.** Dismiss. Independent `JSON.stringify` equality on `selected`, `skipped`, `totalBytes`, `remainingBytes`, `maximumBytes`, `requestedTags`, `unresolvedTags`.
4. **Task key mismatch (`questions` vs `questionTags`).** Dismiss. Plan/ledger use `questionTags`; `verify-context-submission.mjs:18` maps that to selector `questions`.
5. **Missing `repository-rules` in `mandatoryIds`.** Dismiss. `evidence/context-plan.json:11`.
6. **Uncommitted ledger fails `verifyContextHistory`.** Dismiss. `:36` diffs HEAD, not the dirty tree.
7. **`/tmp` vs `/private/tmp` prefix would fail `git show`.** Dismiss for this run. `npm run context:verify` from the app directory sees `process.cwd()` as `/private/tmp/ex-10-01/...`, so `path.relative` at `:28` is `10 Token Economics/exercise-01-token-budget-refactor` and the command exited 0. Mixing a `/tmp/...` `exerciseRoot` argument with a `/private/tmp` toplevel in a throwaway caller is a macOS symlink hazard in the protected verifier, not a defect in these commits.
