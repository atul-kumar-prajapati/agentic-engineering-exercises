# Specialist ownership

Parent: Cursor Grok 4.6. Reviewers: Cursor subagents on `cursor-grok-4.6-high`. All three lanes were parallel and read-only. Only the integration owner writes files.

| Lane | Scope | Out of bounds | Verification command | Output | Write permission |
|---|---|---|---|---|---|
| Policy purity | `DecisionPolicy` repository-freedom; Ready rule ownership; lookup-then-validate-then-save; dual constructors | HTTP JSON field lists; client parser; Git file-set history; snapshot JSON identity | grep architecture on `DecisionPolicy.java` / `WorkflowService.java`; read protected architecture test | Verdict + file:line table | none (read-only) |
| Contract behavior | Five legacy cases, HTTP 202/400/404, client parser, save counts, rejected-state immutability | Policy field types; commit file-set rules; evidence markdown | `./mvnw test`; `npm run test:rules` | Per-case table with proving test file:line | none (read-only) |
| History / evidence integrity | characterizationSha / refactorSha file sets; ancestry; snapshot identity vs `docs/contract-observations.json`; protected paths unchanged | Policy architecture; behavioral correctness | `git diff-tree`, `merge-base --is-ancestor`, `cmp` / `JSON.stringify` | Check table citing `rules-refactor-verification.mjs` | none (read-only) |

Citation tree for every lane: working tree `/tmp/ex-11-03` Java and Git commits named above. No bundle. Protected tests and observations are `upstream/main` at `52090ed`.
