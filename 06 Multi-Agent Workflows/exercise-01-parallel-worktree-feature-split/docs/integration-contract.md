# Integration Contract

Create `integration/parallel-features` from the recorded base SHA.

1. Merge `lane/sla-risk` with `--no-ff`.
2. Merge `lane/saved-filters` with `--no-ff`.
3. Merge `lane/evidence-export` with `--no-ff`.
4. Create one shared-type commit that changes only `src/types.ts`, `src/utils/filters.ts`, and `src/services/workflowApi.ts`.
5. Run the integrated acceptance and repository checks.
6. Commit evidence only after the product and shared-type history is complete.

Each merge commit must retain the exact lane file content. Do not squash, rebase, cherry-pick, or silently fix a lane during its merge.
