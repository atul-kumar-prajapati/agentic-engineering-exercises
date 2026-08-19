# Specialist ownership

Citation tree for every file:line in this review: the `/tmp/ex-10-01` working tree at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20` (same bytes as `upstream/main` for protected catalog/sources). The verifier imports `selectContext` and `docs/context-catalog.json` from that tree and inspects Git objects in this repository. There is no review bundle.

Parent integration owner: Cursor Grok 4.6. Specialist model slug: `cursor-grok-4.6-high`. Write permission: integration owner only. Reviewers were launched in parallel and instructed not to create, edit, or delete files and not to run mutating Git commands.

| Lane | Scope | Out of bounds | Output | Command | Writes |
|---|---|---|---|---|---|
| authority | Classify all six catalog sources for tags `adapter`+`session`, question `errors`, budget 1700. Catalog + `docs/context-sources/*`. | Selector control flow; Git ancestry. | Verdict, 6-row table with file:line, disposition per finding. | `npm run test:context` plus catalog vs `byteLength` recompute. | no |
| selector-semantics | `selectContext.mjs` and learner tests vs `scripts/run-context-tests.mjs`. | Plan membership of a source; commit history. | Verdict, per-behavior table with file:line, disposition. | `npm run test:context` | no |
| evidence-integrity | `verifyContextHistory` / `verifyContextEvidence` vs `planSha` `8d94b4c9daa55fecba34f36c9b643aec78ec803a` and `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20`. | Catalog meaning; selector sort order. | Verdict, constraint table, SHA/file-list proof. | `git diff-tree` / `git merge-base --is-ancestor` as in `context-verification.mjs`. | no |

Lanes were parallel, not serial. Integration owner re-derives every cited line against the working tree before accepting a finding.
