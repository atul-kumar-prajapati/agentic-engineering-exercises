# Integration Contract

Create `integration/parallel-features` from the recorded base SHA.

1. Resolve `BASE_SHA` in `untrusted-handoff.json` to the recorded base SHA. Check its claimed parent and changed paths against Git, and check whether its claimed output exists. Record the result in `integration.json`. Do not merge it if any claim fails.
2. Merge `lane/sla-risk` with `--no-ff`.
3. Merge `lane/saved-filters` with `--no-ff`.
4. Merge `lane/evidence-export` with `--no-ff`.
5. Create one shared-type commit that changes only `src/types.ts`, `src/utils/filters.ts`, and `src/services/workflowApi.ts`.
6. Run the integrated acceptance and repository checks.
7. Commit evidence only after the product and shared-type history is complete.

Each merge commit must retain the exact lane file content. Do not squash, rebase, cherry-pick, or silently fix a lane during its merge.
