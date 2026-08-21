# Pre-change scope plan: export button variant

## Requested behavior

Only the export action should cross the design-system boundary. After the change, `buttonVariantFor("export")` returns `ds-secondary`. Checkout, delete, and unknown legacy actions stay on their current variants.

## Budget, committed before any source edit

This plan is the commit that must land **before** helper or test files change. The budget is exactly **two** source paths and no more than **40** added-plus-deleted lines, measured from the later source commit's Git numstat, not from a working-tree estimate.

Allowed source paths:

- `minimal-diff-app/src/migration/exportButton.mjs`
- `minimal-diff-app/tests/export-button.test.mjs`

No other source path is in scope. Evidence files are committed after the source commit and do not count against this budget.

## Excluded paths

Shared cleanup is excluded because the production request does not need it:

- `src/components` — presentation only; it does not call `buttonVariantFor`
- `src/styles.css` — visual tokens for the lab UI, not the export mapping
- `package.json` — no new dependency is required to add one branch
- `src/App.tsx`, `src/skillWorkflow.ts`, `src/labContract.ts` — lab chrome around the competency, not the helper under change

## Baseline command

Run `node scripts/run-migration-tests.mjs` from `minimal-diff-app`. On the starting tree this fails because export still returns `legacy-primary`. After the source commit it must pass, together with the learner test that names export, checkout, delete, and unknown.

## Why a broad rewrite is unnecessary

The seeded helper already owns every action's variant. Adding an export branch preserves the delete guard and the default `legacy-primary` fallback. Rewriting components, styles, or unrelated call sites would burn tokens and review time on files the request does not name.
