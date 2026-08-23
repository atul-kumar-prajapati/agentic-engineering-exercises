# Export Button Migration Scope

Required change: `buttonVariantFor("export")` returns `ds-secondary`.

Protected real consumers in `src/migration/actionButtons.mjs`:

- `checkout` returns `legacy-primary`.
- `delete` returns `legacy-danger`.
- Other legacy actions continue returning `legacy-primary`.

Pre-change budget: two source files and 30 added-plus-deleted lines. The only allowed source paths are `src/migration/exportButton.mjs` and `tests/export-button.test.mjs`. `actionButtons.mjs`, shared components, styles, and packages are visible but outside scope. Evidence files are committed separately after the source commit. No scope expansion is needed.

If the source commit uses more than 20 changed lines, `scope-budget.json` must include a `lineJustification` explaining why the smaller implementation was insufficient.
