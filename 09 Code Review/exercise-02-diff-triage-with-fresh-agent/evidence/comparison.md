# Comparison — Fresh Review vs Remediation

## Reproduced blockers (before → after)

| ID | Reproduction on risky head 8242a84 | Remediation at 7f42132 | Proof |
|---|---|---|---|
| CACHE-001 `src/App.tsx:41` | `useEffect(..., [filters.priority, filters.status])` calls `clearCachedWorkflowItems()` on every filter change and on mount; `run-app-cache-checks.mjs` failed ("filter changes must not delete persisted workflow data") | Effect and import deleted from `src/App.tsx` | `npm run test:cache` head: exit 1 → fixed: exit 0; `PASS filter changes do not clear persisted workflow data`; run-app-cache-checks asserts `App.tsx` contains no `clearCachedWorkflowItems` |
| CACHE-002 `src/services/workflowApi.ts:10` | `JSON.parse(cached)` unguarded: malformed JSON rejects `fetchWorkItems` (app stuck loading); non-array JSON blindly cast and returned; acceptance test "recovers from malformed and non-array cached JSON" failed | `readCachedItems()` try/catch + `Array.isArray` + `removeItem` for invalid entries; defaults fallback | `tests/cache-regressions.test.ts` "falls back to fixture defaults when cached JSON is malformed" and "...non-array value"; protected acceptance test passes |
| CACHE-003 `src/services/workflowApi.ts:13` | `workItems.sort(...)` mutates the exported fixture in place and returns the shared reference; acceptance test "orders a copy without mutating the shared fixture" failed | `return [...workItems].sort(...)` — copy only | `tests/cache-regressions.test.ts` "returns defaults in due-date order without mutating the shared fixture" (fixture order asserted untouched, `loaded !== workItems`) |
| CACHE-004 `src/services/workflowApi.ts:37` | `collectEvidence` overwrote the cache with a stale fixture snapshot; acceptance test "collects evidence without changing cached workflow data" failed | Storage write removed; function is read-only | `tests/cache-regressions.test.ts` "collects evidence without changing cached workflow data" (sentinel unchanged) |

Save persistence (the boundary CACHE-001/CACHE-002 jointly restore) is pinned by `tests/cache-regressions.test.ts` "persists a saved action so it survives a filter-driven reload": `saveAction` now writes the merged list to the cache (`workflowApi.ts:52`) and the next `fetchWorkItems` reads it back.

## Unsupported claims

- **CLAIM-001 ("saveAction mutates the shared workItems fixture in place") — dismissed, unchanged by remediation.** Exact code evidence at head 8242a84, `src/services/workflowApi.ts:22,27-32`: the function only reads `workItems.find(...)` and returns `{ ...item, status, owner, note }` — a new object; no array element is reassigned, no `splice`, no storage write. The claim superficially resembles the real CACHE-003 (in-place *sort* in `fetchWorkItems`) but does not hold against the comparison range. The fresh reviewer reached the same conclusion independently when asked directly, without being told the claim existed.

## Scope

- Remediation commit 7f42132 touches exactly three files — `src/App.tsx`, `src/services/workflowApi.ts`, `tests/cache-regressions.test.ts` — verified with `git diff-tree --no-commit-id --name-only -r`. No unrelated refactoring; `clearCachedWorkflowItems` kept exported (unused) as the smallest change; all 42 protected inputs byte-identical to upstream (guardrail proof in `evidence/guardrails.md`).
- Fresh-session boundaries held: the reviewer received exactly `docs/review-brief.md`, `fixtures/manifest.json`, `pr/review-target.diff` (+ mounted head for reproduction), with implementer notes, earlier reviews, expected finding IDs, and implementation chat excluded; the prompt is hash-bound (`promptSha256` da65780…16bc) in `evidence/reviewer-session.json`.

## Regression tests

`tests/cache-regressions.test.ts` (5 focused tests, all passing) maps 1:1 to the four blockers plus save persistence: malformed JSON fallback, non-array JSON fallback, fixture immutability under sort, save persistence across reload, and read-only evidence collection. CACHE-001's regression guard is the protected `run-app-cache-checks.mjs` in `test:cache` (forbids `clearCachedWorkflowItems` in `App.tsx`); a component-level filter-change test would need `@testing-library/react`, which is not a dependency and `package.json` is protected — documented rather than forced.

## Command results

| Command | Risky head | Remediation |
|---|---|---|
| `npm run test:cache` | exit 1 (4/4 acceptance tests failed, app cache check failed) | exit 0 (9/9 tests, app cache check PASS) |
| `npm run agent:check` | exit 0 (blockers invisible to quality gates) | exit 0 |
| `npm run triage:verify` | n/a (evidence not yet produced) | exit 0, Source SHA 7f4213225b0ba7317302bd04beb7c5ef01d8ad81 |
| `node scripts/verify-review-fixture.mjs` | exit 0 | exit 0 |

The before/after delta on `test:cache` (4 failures → 9 passes) is the direct proof that every seeded defect died and no deliberate behavior was lost — the tool was run on both states.
