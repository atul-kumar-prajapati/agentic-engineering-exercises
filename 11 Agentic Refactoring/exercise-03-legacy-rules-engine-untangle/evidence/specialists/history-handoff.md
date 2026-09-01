# History / evidence-integrity handoff

Lane: Git binding and snapshot identity. Reviewer: Cursor subagent `cursor-grok-4.6-high`. Read-only. Citation tree: Git commits on `/tmp/ex-11-03`. `git diff --name-only refactorSha HEAD` is commit-to-commit (`rules-refactor-verification.mjs:31`), not the working tree.

**Verdict: PASS.** Integration owner re-ran `diff-tree` / `merge-base --is-ancestor` / `JSON.stringify` equality.

| Check | Result | Verifier |
|---|---|---|
| characterizationSha `e73626090569a3107739dbb599ec5f19ced369e4` ancestor of refactorSha | exit 0 | `rules-refactor-verification.mjs:16` |
| refactorSha `45238cc3d7c484720c5d9bbece5cbb31cb593bd0` ancestor of HEAD | exit 0 | `:17` |
| characterization `diff-tree` | exactly `evidence/contract-before.json` and `WorkflowPolicyCharacterizationTest.java` | `:19-24` |
| refactor `diff-tree` | exactly `DecisionPolicy.java` and `WorkflowService.java` | `:25-30` |
| snapshots | `contract-before.json` / `contract-after.json` / `docs/contract-observations.json` JSON.stringify-equal | `:6-9` |
| protected vs `52090ed` | 19 paths unchanged | `challenge-integrity.json` |

| id | claim | disposition |
|---|---|---|
| H1 | Untracked `contract-after.json` / patches look like a later-files leak | **dismiss** — `:31` is commit-to-commit; untracked files are invisible until the evidence commit |
| H2 | Evidence-only tail empty while HEAD == refactorSha | **dismiss** — expected before the evidence commit |

No history rewrite. Evidence commit will follow and must stay under `…/evidence/`.
