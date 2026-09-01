# Evidence Integrity Handoff — Exercise 11.1

Lane: evidence integrity (read-only). Verdict: **clean on every machine-checked contract**, with one low-severity wording defect (accepted and fixed). Both verification commands (`npm run refactor:verify`, `node ../../../scripts/comparable-evidence.mjs ..`) — exit code: 0 each. `evidence/verification.md`, `evidence/guardrails.md`, `evidence/integration.md`, and `evidence/specialists/*` were pending later phases when the lane ran and were correctly not flagged as missing.

## Findings and disposition

| # | Finding | Disposition |
|---|---|---|
| 1 | `evidence/after.md` scope inconsistency: the "Changed files" and "Lines added and removed" bullets sat in the patch-metadata block but described only the refactor commit (+33/−21, one file), while `after.patch` is the cumulative 3-file diff (+213/−21 including the characterization test and baseline from `af05bfa`); `before.md`'s identically-named fields were patch-scoped, so the two files used inconsistent scopes | **Accepted — fixed before the evidence commit.** Both files now state their scope explicitly: `before.md` notes its patch and implementation commit are the same single commit; `after.md` gives the refactor-commit figures plus the cumulative patch totals (3 files, +213/−21). |

## What the lane checked and found clean

- `submission-contract.json`: all 7 required files re-measured with node (1682 / 3063 / 3063 / 445 / 4302 / 3507 / 539 characters against floors 700 / 2500 / 2500 / 150 / 900 / 700 / 250); every `includeAll` substring present; valid JSON for the three JSON files; the repo's own `verify-submission-contract.mjs` exit 0.
- `before.md` / `after.md` field rules: all 8 required fields present in both; `Human hints: 0` and `Retries: 0`; 40-character Starting/Implementation SHAs; Patch SHA-256 equals the actual sha256 of each patch (`8bb2adee…` / `43403942…`); the four match-fields identical across both files; numstat claims match `git show --numstat` for `bf7b280` and `550e1a2`; the after implementation commit is a descendant of the starting commit and an ancestor of HEAD.
- Patches: byte-identical to `git diff --binary --full-index 52090ed <implementation>` of their runs; apply to the starting commit; differ from each other.
- Outputs: both 3063 bytes, valid JSON, required substrings present, byte-identical to each other (both sha256 `5ce2ade…`), both matching all 10 golden cases on name/input/expected; the oracle re-run in both worktrees reproduces the same hash, exit 0.
- `history.json`: 445 characters ≥ 150; both 40-char SHAs; `af05bfa` diff-tree exactly `[evidence/before-output.json, rules-refactor-app/src/rules/legacyEligibility.characterization.test.mjs]`; `550e1a2` diff-tree exactly `[rules-refactor-app/src/rules/legacyEligibility.mjs]`; `git diff --name-only refactorSha HEAD` empty at review time; full ancestry `52090ed` → `af05bfa` → `550e1a2` → HEAD verified.
- `behavior-decisions.md`: every `file:line` citation re-checked against the starting-commit source and the golden-case file — all correct.
- `refactor-steps.md`: floors and substrings including `exit code: 0`; quoted commit messages match `git log`; sweep arithmetic 7×14×14×6×6 = 49,392 re-derived.
- Command captures: re-ran the oracle in both worktrees, the characterization test, and `/tmp/parity/sweep.mjs` — identical outputs and exit codes; sweep module copies sha256-identical to the starting-commit, `bf7b280`, and `550e1a2` modules.
- `comparison.md`: required terms present; quoted SHAs, hashes, byte sizes (12,678 / 8,507) all correct; six review dimensions match README step 2; "21 documented behaviors" equals the actual harness case count; the sparse-worktree withholding claim corroborated.
- Protected inputs: `git diff 52090ed -- docs/` empty; `npm run test:integrity` — "Verified 14 protected challenge inputs", exit 0; the working-tree characterization test is identical to the `af05bfa`-committed version and imports only the public export.
- Attestation-only fields (time limit, hints/retries, "no network", prompt texts, withheld-inputs narrative): internally consistent, cross-consistent across `before.md`/`after.md`/`comparison.md`, and disclosed in the session notes — noted by the lane as inherent to the exercise design rather than independently derivable from artifacts.
