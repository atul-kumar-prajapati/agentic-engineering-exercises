# Export Button Migration Scope

Required change: `buttonVariantFor("export")` returns `ds-secondary`.

Protected unchanged behavior:

- `checkout` returns `legacy-primary`.
- `delete` returns `legacy-danger`.
- Other legacy actions continue returning `legacy-primary`.

Pre-change budget: two source files and 40 added-plus-deleted lines. The only allowed source paths are `src/migration/exportButton.mjs` and `tests/export-button.test.mjs`. Evidence files are committed separately after the source commit. No scope expansion is needed for this challenge.
