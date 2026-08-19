# Integration

Parent: Cursor Grok 4.6. Specialists: `cursor-grok-4.6-high`, parallel, read-only. Citation tree: working tree / Git objects at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20`. No bundle.

## Prioritisation

1. History binding (plan before source, focused commits) — already satisfied before review.
2. Authority partition — must match the 1700-byte adapter+errors task.
3. Selector semantics — must match protected `run-context-tests.mjs`.
4. Coverage gaps that would require editing tests after `sourceSha` — cannot ship.

## Disposition

| Finding | Lane | Disposition | Why |
|---|---|---|---|
| Six-source classification matches plan and ledger | authority | **accept** | Re-derived catalog lines 2–7 and source sentences; bytes 2580 / 1562 |
| Selector matches protected + learner pins | selector-semantics | **accept** | Re-derived `selectContext.mjs` lines; corrected learner ID-order pin to `:15-17` |
| planSha / sourceSha focused history | evidence-integrity | **accept** | `diff-tree` lists only the required files |
| Ledger unmodified selector output | evidence-integrity | **accept** | Seven result fields JSON-equal a fresh run |
| Error contract initially relevant without `errors` | authority | **reject** | `tests/context-selector.test.mjs:23` skips it as `irrelevant` without questions |
| Stale selected for priority or size | authority | **reject** | Skipped `stale`; `evidence/context-plan.json:18` |
| Unrelated UI/audit selected | authority | **reject** | Skipped `irrelevant` |
| Mandatory omitted | authority | **reject** | `docs/context-catalog.json:2`; `mandatoryIds` `:11` |
| Catalog bytes wrong | authority | **reject** | All six `byteLength` match |
| Stale high-priority selected by selector | selector-semantics | **reject** | `:35` and `:53` require current authority |
| Over-budget labeled `irrelevant` | selector-semantics | **reject** | `:74` is `"budget"`; protected `:28` |
| Reversed tags break equality | selector-semantics | **reject** | `uniqueSorted` `:3-4` |
| Extra files in focused commits | evidence-integrity | **reject** | `diff-tree` exact |
| Truncated SHAs | evidence-integrity | **reject** | 40-char |
| `/tmp` symlink prefix | evidence-integrity | **reject** | `npm run context:verify` exit 0; cwd is `/private/tmp/ex-10-01` |
| Equal-priority id tie-break untested | selector-semantics | **defer** | Unique priorities in this catalog; cannot edit tests after `sourceSha` |
| Exact-fit and `continue` vs `break` untested | selector-semantics | **reject** (not a defect) | `>` keeps exact fit; `continue` is priority-then-fill |

No selector or test edits followed review. `after.patch` remains the unaided companion attempt (`803df79f4525c664d7124840ac6d55e32cce239d`).
