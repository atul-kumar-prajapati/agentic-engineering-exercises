# Preflight / retry policy handoff

Lane: preflight. Reviewer model: cursor-grok-4.6-high. Source: `9904a0a9a23333b8da2d4417a1febe79daf53359`.
Verification: `node ./scripts/run-analysis-tests.mjs` exit 0 (re-run by integration). 14 additional probes exit 0.

## Findings

None.

## Dismissed

| ID | Concern | Disposition | Evidence |
|---|---|---|---|
| P1 | Command identity might be `event.command` | Dismiss | Match is `event.target === command` at `preflightPolicy.mjs:14`, gated by `type === "command"` at `:13`. Protected fixtures put the command on `target` (`run-analysis-tests.mjs:39`). |
| P2 | Latest match might be first-in-array | Dismiss | `preflightPolicy.mjs:18-28` keeps the greater `sequence`. |
| P3 | Later diagnosis might be array-index | Dismiss | `preflightPolicy.mjs:31-33` uses `event.sequence > afterSequence`. |
| P4 | Empty / undefined `events` | Dismiss | `preflightPolicy.mjs:42` coerces to `[]` → first-attempt allow (`preflight-contract.md:5`). |
| P5 | README “cannot repeat until diagnosis” vs latest-passed-after-fail allowing | Dismiss | Operational rule is `preflight-contract.md:5`: deny only when the *latest* identical command failed. `preflightPolicy.mjs:48-49` follows the contract, not the looser README sentence (`README.md:25`). |
| P6 | Fail, diagnose, fail again should still deny | Dismiss | Latest is the second failure; diagnosis is not later than that sequence → deny. Correct. |
| P7 | Trace mutation | Dismiss | Read-only walk; frozen-array probe unchanged. `preflight-contract.md:7`; `preflightPolicy.mjs:41-55`. |

## Integration

Accept the PASS. No preflight edits. Integration re-ran protected asserts plus target-identity, latest-by-sequence, diagnosis-by-sequence, latest-passed-after-fail, fail–diagnose–fail, and no-mutation probes (14/14).
