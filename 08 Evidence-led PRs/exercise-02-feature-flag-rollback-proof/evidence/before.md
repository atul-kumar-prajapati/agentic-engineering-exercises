# Ordinary first attempt

## Session conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: `a9d966b904f1758d11cde4cbf5d2bc4f13ed95bd` on `codex/exercise-08-02-feature-flag-rollback-proof-before`
- Agent and model: Cursor Grok 4.6, Task subagent slug `cursor-grok-4.6-high` (explicit, not inherited)
- Tools and permissions: file tools and shell in an isolated git worktree at `/tmp/ex-08-02-before`; no verifier or contract files; no hints
- Time limit: 45 minutes; the attempt completed within the limit
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch`

The ordinary agent received only the product request. It did not receive `docs/flag-brief.md`, `docs/rollback-contract.md`, or the evidence templates.

## Files changed

2 files, `+264 / -11` (`git show --numstat a9d966b904f1758d11cde4cbf5d2bc4f13ed95bd`).

- `feature-flag-app/src/rollout/invoicePreview.mjs`
- `feature-flag-app/scripts/rollback-invoice-preview.mjs` (new)

## Flag states (measured on commit `a9d966b904f1758d11cde4cbf5d2bc4f13ed95bd`)

`npm run test:rollout` exit code: `1` (3 of 6 cases failed). Each row below is an independent `executeScenario` result from that commit, not a restatement of the test names.

| State | Experience | Preview API calls | Telemetry events | Check exit code |
|---|---|---:|---:|---:|
| Enabled (`acct-100`) | preview | 1 | 1 (`invoice_preview_viewed`) | 0 |
| Disabled (`acct-999`) | legacy / `flag-disabled` | 0 | 0 | 0 |
| Provider error | legacy / `provider-error` | 0 | 0 | 1 |
| Invalid context (`acct-100` vs `acct-200`) | preview (not legacy) | 1 (`acct-200`) | 1 | 1 |
| API failure | legacy / `api-error` | 1 | 0 | 1 |

Enabled path used `getBooleanValue(..., false, context)` and emitted `targetingKey`, `accountId`, and `flagKey`. Disabled path returned legacy with zero side effects. Those two states matched the contract by coincidence.

## Unproved behavior (each claim independently re-derived)

1. **Invalid context still evaluates and calls the preview API.** `isValidTargetingContext` at `invoicePreview.mjs:7-8` only checks that both strings are non-empty. It does not require `targetingKey === accountId`. Measured outcome for `{ targetingKey: "acct-100", accountId: "acct-200" }`: one evaluation, `apiCalls: [{ accountId: "acct-200" }]`, one `invoice_preview_viewed`, experience `preview`. Flag brief requires `{ experience: "legacy", reason: "invalid-context" }` with zero evaluations and zero side effects.

2. **Provider-error reason is not the required token.** Catch at `invoicePreview.mjs:29` returns `provider-error`. Protected test `run-rollout-tests.mjs:26` and flag brief require `flag-evaluation-error`. Side effects were zero; only the reason string failed.

3. **Preview API failure reason is not the required token.** Catch at `invoicePreview.mjs:40` returns `api-error`. Flag brief requires `preview-unavailable`. One API call and zero telemetry were otherwise correct.

## Rollback (measured on a `/tmp` copy; protected config not touched)

- Invalid timestamp `not-a-timestamp`: exit code `0`, configuration digest changed (`d24ea840…` → `7d7ce52f…`). The CLI treats timestamp as `requireNonEmpty` at `rollback-invoice-preview.mjs:171` with no `Date.parse` check, then writes `revision: "rollback-not-a-timestamp"` at `:102`.
- Valid drill timestamp `2026-08-14T10:30:00.000Z`: exit code `0`, but `revision` is `rollback-2026-08-14T10:30:00.000Z` (colons and dots kept). `lastRollback` is absent; audit lives under `audit` with keys `action`, `actor`, `reason`, `timestamp`, `previousRevision`, `previousEnabled`.

Rollback audit path: none of the required `lastRollback` object. Invalid-input safety: failed (mutated before rejecting).
