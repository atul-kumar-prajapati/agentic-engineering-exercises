# Integration

Prioritisation: replay honesty first (blocks the competency), then Git binding, then metric/preflight correctness already proven by protected tests.

## Disposition

| Finding | Lane | Action | Why |
|---|---|---|---|
| F1 spliced replay | Replay / evidence | **Fix** | `replay-contract.md:5` forbids editing events to improve the score. Replaced `evidence/replay-events.json` with a 10-event POLICY-217 session (preflight-blocked retry, FV after last write). Regenerated `after.json` from live `analyzeSession`. Preventable calls 4 → 1. |
| Metrics PASS | Metrics | **Accept** (no code change) | Independent recount and eight probes matched `session-events.json` / `run-analysis-tests.mjs:13-21`. |
| Preflight PASS | Preflight | **Accept** (no code change) | Protected asserts plus 14 probes, including no mutation. |

## Rejected / not implemented

| Claim | Why rejected |
|---|---|
| Tighten required-field rejection to always throw on missing `target` / `result` | Not a protected-test requirement (`run-analysis-tests.mjs:36-37`). Expanding throws would be scope outside `sourceSha` (already committed) and is not a defect against the 13-event trace. |
| Reset retry state on a passed command without diagnosis (before-attempt behavior) | Rejected. `metric-contract.md:4` resets on diagnosis or revision change, not on pass. Shipping the before behavior would hide fail → pass → fail. |
| Degrade the before attempt so the comparison looks dramatic | Rejected. Unconstrained `test:analysis` already exited 0. Independent variable is contracts-as-input plus Git-bound `sourceSha`. |

## Source commit

`sourceSha` `9904a0a9a23333b8da2d4417a1febe79daf53359` is the unaided after implementation (fast-forward). After that commit, only `evidence/` may change (`retro-verification.mjs:30-31`). Analyzer / preflight blobs were not edited after F1; only the replay trace changed.
