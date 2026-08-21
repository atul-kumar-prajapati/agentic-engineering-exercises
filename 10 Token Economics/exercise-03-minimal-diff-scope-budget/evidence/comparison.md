# Comparison

Independent variable: a pre-committed two-file / 40-line scope plan, not measured helper quality. Both first attempts used Cursor, model `cursor-grok-4.6-high`, the same tools and permissions, a 30-minute first-attempt rule, and the same production request (export → `ds-secondary`).

The after run received the committed scope plan and the exercise contracts only. It did not receive the previous implementation, before.patch, or any explanation of the first attempt.

## Scope

The unconstrained before attempt was already small. Re-derived numstat vs `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`: 2 files, 12 changed lines (11 additions, 1 deletion). Paths were the helper and a compact learner test. No `src/components`, `src/styles.css`, or `package.json` edits.

The budgeted after attempt used the same two paths: 2 files, 40 changed lines (39 additions, 1 deletion). The extra volume is the learner test's Given-When-Then wrappers (38 insertions), not a shared-legacy rewrite.

A too-good baseline is a finding, not a problem to fix. This file does not degrade the before patch.

## Behavior

Both attempts map export to `ds-secondary` and leave checkout, delete, and unknown on their legacy variants. Protected `run-migration-tests.mjs` exits 0 on both trees. Quality of the mapping is not the independent variable.

## What the correct-looking before artifact still cannot enforce

- Plan-before-code history. The before branch has no `scope-plan.json` / `scope-plan.md` commit that `merge-base --is-ancestor` can bind to a later source SHA (`scope-verification.mjs:17-22`).
- A Git-derived ledger. Before line counts live in a patch; they are not `ledger.actual` fields checked with `!==` against `git show --numstat` (`scope-verification.mjs:26-28`).
- Excluded paths declared before the edit. The before session happened not to touch components and styles; nothing in that session committed that exclusion.
- Evidence-only follow-up. The before result commit mixes helper and test; there is no `sourceSha` with later `git diff --name-only sourceSha HEAD` restricted to `evidence/` (`scope-verification.mjs:29-30`).

## Review cost

Before review surface: 12 changed lines, two files, plus a JSDoc rewrite. After review surface: 40 changed lines, two files, four named learner cases. The after cost is the declared budget and the test that names export, checkout, delete, and unknown. The Git binding is what makes that budget auditable.
