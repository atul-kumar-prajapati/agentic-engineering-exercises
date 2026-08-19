# Before / After Comparison — review-gauntlet exercise

Both passes ran in the same opencode session with model glm-5.3 (opencode-go/glm-5.3), the same tool permissions (read-only review powers plus writes confined to the exercise app and `evidence/`), and the same 45-minute exercise budget. The only independent variable between `before` and `after` is the remediation commit `8b68ece04bbbfa2958ca8a777795714b906716d0`; no human hints were used in either pass.

## True positives

| | Before | After |
|---|---|---|
| SEC-001 (critical, semgrep, ActionComposer.tsx:31) | Confirmed: reviewer-controlled `note` state rendered via `dangerouslySetInnerHTML`; reproduced by data-flow trace, scanner warning matched to a live sink | Fixed: preview renders `{note}` as an escaped React text child (`evidence/after.patch`, ActionComposer.tsx:26) |
| Scanner total | 2 findings, 1 true positive / 1 false positive | Same rule, same 2 locations classified; dynamic sink eliminated at the source |

## False positives

| | Before | After |
|---|---|---|
| SCAN-001 (info, semgrep, SafeAnnouncement.tsx:7) | Dismissed with source proof: module-level `const` string, no interpolation/state/props — static and source-controlled | Unchanged and intentionally retained; the component check gate still asserts the deliberate finding remains (`scripts/run-review-component-tests.mjs:24`) |

## Manual findings (no scanner warning existed)

| | Before | After |
|---|---|---|
| A11Y-001 (high, WorkQueue.tsx:16) | Queue rows are `<div onClick>`; keyboard-only users cannot focus or activate any row | Rows are native `<button type="button">`; focus, Enter/Space activation, and button semantics restored (WorkQueue.tsx:9) |
| VAL-001 (high, ActionComposer.tsx:48) | Save button lost `disabled={saving \|\| note.trim().length < 8}` and `type="button"`; short notes submitted unchecked | Guard and explicit type restored (ActionComposer.tsx:30); server note-length check also restored |
| POL-001 (critical, reviewPolicy.ts:4) | `includes("approved")` early return bypasses note validation and the Blocked/Escalated→Ready guard; client coerces High-priority drafts to Ready | Early return deleted, base guard order restored (reviewPolicy.ts:4-7); client `normalizedStatus` coercion removed (ActionComposer.tsx:17-19) |

## Server-boundary coverage

Before: `workflowApi.ts:18` still called `assertAllowedTransition` before persisting, but the policy body was hollow — the "approved" early return made both guards unreachable for any note containing the magic word, and the note-length rule was deleted outright. After: the boundary enforces the eight-character meaningful-note rule first, then the Blocked/Escalated→Ready prohibition, matching the protected `src/server/reviewPolicy.test.ts` expectations exactly.

## Tests

Before: no `tests/` directory; `npm run test:review` exit 1. After: `tests/review-regressions.test.ts` adds 13 assertions across 4 suites — untrusted note rendering (SEC-001), keyboard-operable native buttons (A11Y-001), short-note rejection client and server (VAL-001), and blocked/escalated transitions with "approved" wording plus the removed client coercion (POL-001) — and `npm run test:review` exits 0 with 18 tests passing across both files.

## Command results

| Command | Before exit | After exit |
|---|---|---|
| `npm run test:integrity` | 0 | 0 |
| `node ../scripts/verify-review-fixture.mjs` | 0 | 0 |
| Semgrep scan of the review head | 0 (2 findings) | not re-run against the head — the head is immutable; the fix is proven by the component gate and regression tests instead |
| `npm run test:review` | 1 | 0 |
| `npm run review:verify` | 1 | 0 |
| `npm run agent:check` | 0 | 0 |

Every change in `evidence/after.patch` maps to a finding ID: ActionComposer.tsx (SEC-001, VAL-001, POL-001 client half), WorkQueue.tsx (A11Y-001), reviewPolicy.ts (POL-001 server half), tests/review-regressions.test.ts + tests/raw-modules.d.ts (regression proof for all four fixed findings).

## Harness limitations recorded, not worked around

- The shipped `semgrep.yml` is invalid YAML and its literal pattern does not parse; an equivalent rule (same id/message/severity/languages, parseable JSX pattern) was executed and the substitution is documented in `evidence/semgrep.txt`. The protected file was left untouched.
- Semgrep was not installed on the machine; it was installed into a throwaway virtualenv outside the repository (`semgrep-venv`), never globally and never inside the exercise app.
