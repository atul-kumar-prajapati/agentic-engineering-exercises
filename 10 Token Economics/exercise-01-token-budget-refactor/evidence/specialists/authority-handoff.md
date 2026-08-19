# Authority / relevance handoff

Reviewer: `cursor-grok-4.6-high` (read-only). Citation tree: working tree at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20` / catalog and sources as checked in (no bundle). Integration owner re-derived every file:line below against those files.

**Verdict (reviewer): PASS.** Integration: **accept** the classification. `npm run test:context` exit 0 independently confirmed.

## Six-source table

| id | class | bytes | planned / ledger | catalog | supporting sentence |
|---|---|---:|---|---|---|
| repository-rules | mandatory | 489 | selected / `mandatory` | `docs/context-catalog.json:2` | `docs/context-sources/AGENTS.md:3` |
| current-adapter-contract | relevant-current | 647 | selected / `relevant` | `docs/context-catalog.json:3` | `docs/context-sources/current-adapter-contract.md:3` |
| current-error-contract | relevant-current (question `errors` only) | 426 | selected / `relevant` | `docs/context-catalog.json:4` | `docs/context-sources/current-error-contract.md:3` |
| legacy-migration-notes | stale | 412 | skipped / `stale` | `docs/context-catalog.json:5` | `docs/context-sources/legacy-migration-notes.md:3` |
| ui-style-guide | unrelated | 310 | skipped / `irrelevant` | `docs/context-catalog.json:6` | `docs/context-sources/ui-style-guide.md:5` |
| audit-retention | unrelated | 296 | skipped / `irrelevant` | `docs/context-catalog.json:7` | `docs/context-sources/audit-retention.md:3` |

Bytes re-derived: 489+647+426+412+310+296 = 2580 unbudgeted; selected 1562.

## Findings

None to fix.

## Dismissed

1. **Error contract treated as initially relevant without `errors`.** Dismiss. Tags on `docs/context-catalog.json:4` are `errors`/`validation`, not `adapter`/`session`. Plan states that at `evidence/context-plan.md:22` and `:30`. Without questions, learner skip reason is `irrelevant` (`tests/context-selector.test.mjs:23`).
2. **Stale source selected because priority 200 > 100 or smaller byte cost.** Dismiss. `expectedSkipIds` includes it (`evidence/context-plan.json:18`); ledger reason `stale`.
3. **Unrelated UI/audit selected.** Dismiss. `evidence/context-plan.json:19-20`; `docs/large-doc-pack.md:5`.
4. **Mandatory omitted.** Dismiss. Sole `mandatory: true` row is `docs/context-catalog.json:2`; `mandatoryIds` is `evidence/context-plan.json:11`.
5. **Catalog `bytes` mismatch files.** Dismiss. All six `byteLength` values match; protected suite prints `PASS real UTF-8 source costs match the protected catalog`.
