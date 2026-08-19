# After — Remediation and Fresh Recheck

## Remediation commit

- **sourceSha:** 7f4213225b0ba7317302bd04beb7c5ef01d8ad81 (full 40-char commit containing only the focused source fixes and learner tests)
- **Files changed (exactly three, verified with `git diff-tree --no-commit-id --name-only -r`):** `fresh-review-app/src/App.tsx`, `fresh-review-app/src/services/workflowApi.ts`, `fresh-review-app/tests/cache-regressions.test.ts`
- **Lines:** 98 insertions(+), 11 deletions(-) across the three files
- **Patch:** `evidence/after.patch` is `git show 7f4213225b0ba7317302bd04beb7c5ef01d8ad81`

## Fixed finding IDs

- **CACHE-001** — removed the filter-keyed `clearCachedWorkflowItems()` effect and its import from `src/App.tsx`; filter changes no longer touch persisted workflow data.
- **CACHE-002** — `readCachedItems()` parses inside try/catch, accepts only `Array.isArray` results, removes invalid entries, and `fetchWorkItems` falls back to fixture defaults on malformed or non-array cached JSON.
- **CACHE-003** — default ordering is `[...workItems].sort(...)`: a copy, never an in-place mutation of the shared fixture.
- **CACHE-004** — the `localStorage.setItem` was removed from `collectEvidence`; evidence collection is now read-only.

**Dismissed claim:** CLAIM-001 (saveAction mutates the shared fixture) — unsupported; `saveAction` returns a new spread object and never writes the fixture (`src/services/workflowApi.ts:22,27-32` at head). No change made for it.

## Fresh recheck of the remediation commit

- **Recheck agent and model:** opencode subagent (general lane), glm-5.3 (opencode-go/glm-5.3), fresh session, read-only, given only `remediation.diff` and the fixed head source.
- **Verdicts:** malformed/non-array cache recovery **verified** (`workflowApi.ts:6-18,24-32`); immutable defaults **verified** (`workflowApi.ts:31`, `[...workItems]` copy, fixture never mutated); save persistence **verified** (`workflowApi.ts:38-54`, cache write-back read on next load); read-only evidence collection **verified** (`workflowApi.ts:56-63`, no storage access); filter-change safety **verified** (`App.tsx:8,20-25`, destructive effect deleted).
- **Recheck observations dispositioned:** (1) no component-level test simulates a filter change — the designed guard for CACHE-001 is the protected `scripts/run-app-cache-checks.mjs` (asserts `App.tsx` contains no `clearCachedWorkflowItems`) which runs in `test:cache`; component testing would require `@testing-library/react`, not a dependency, and `package.json` is protected. Guard accepted as the exercise's intended check. (2) `clearCachedWorkflowItems` remains exported but uncalled — kept, smallest-change principle; its use in `App.tsx` is what the protected check forbids. (3) empty-string cached value falls back to defaults (safe) without deleting the entry — within contract, noted. (4) cached array element shape is not validated — beyond the "malformed or non-array" contract, noted as residual hardening.

## Command results on the remediation commit

| Command | Result | Exit code |
|---|---|---|
| `npm run test:cache` | 2 test files passed — protected cache acceptance (4/4) and `tests/cache-regressions.test.ts` (5/5), 9 tests total; `PASS filter changes do not clear persisted workflow data` | 0 |
| `npm run agent:check` | integrity, lint, test, format, typecheck, build all passed | 0 |
| `npm run triage:verify` | Source SHA bound; fresh reviewer context, exact protected comparison, four cache blockers + unsupported claim, focused fixes, evidence-only later history — all PASS | 0 |

Full captured outputs: `evidence/focused-tests.txt`, `evidence/commands/triage-verify.txt`, `evidence/fixture-verification.txt`, `evidence/guardrails.md`. Comparison of before/after in `evidence/comparison.md`.
