# Evidence-led first attempt

## Session conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` (identical to the before attempt)
- Implementation commit / source SHA: `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1` on `codex/exercise-08-02-feature-flag-rollback-proof`
- Companion first-attempt commit: `44bb454b8dd237d0936a94c3cfe7f5cb46fd4402` on `codex/exercise-08-02-feature-flag-rollback-proof-after` (same two files; unaided attempt kept)
- Agent and model: Cursor Grok 4.6, Task subagent slug `cursor-grok-4.6-high` (explicit, not inherited). Same tools, permissions, 45-minute limit, first-attempt rule, and zero hints/retries as the before attempt.
- Independent variable: the after agent received `docs/flag-brief.md`, `docs/rollback-contract.md`, `docs/evidence-contract.md`, and was allowed one `npm run test:rollout` run.
- Patch: `evidence/after.patch` (unaided first-attempt diff). Integration review did not change the implementation; `git diff 44bb454b8dd237d0936a94c3cfe7f5cb46fd4402 fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1 -- '*.mjs'` is empty of semantic edits (same two files).

## Files changed

2 files, `+132 / -11` (`git show --numstat fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`).

- `feature-flag-app/src/rollout/invoicePreview.mjs` (`+36 / -11`)
- `feature-flag-app/scripts/rollback-invoice-preview.mjs` (`+96 / -0`)

## Flag states (measured at source SHA `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`)

`npm run test:rollout` exit code: `0` (6 of 6). Each of the five required states was also executed separately via `executeScenario`; raw rows are in `evidence/commands/five-states.txt`. Generated JSON covers enabled, disabled, and provider-error.

| State | Experience | Preview API calls | Telemetry events | Check exit code |
|---|---|---:|---:|---:|
| Enabled (`acct-100`) | preview, total 42 USD | 1 | 1 (`invoice_preview_viewed` with `targetingKey`, `accountId`, `flagKey`) | 0 |
| Disabled (`acct-999`) | legacy / `flag-disabled` | 0 | 0 | 0 |
| Provider error | legacy / `flag-evaluation-error` | 0 | 0 | 0 |
| Invalid context (`acct-100` vs `acct-200`) | legacy / `invalid-context` | 0 | 0 | 0 |
| API failure | legacy / `preview-unavailable` | 1 | 0 | 0 |

### Per-state source (re-derived, not copied from the specialist)

1. **Enabled.** `invoicePreview.mjs:22` calls `getBooleanValue(FLAG_KEY, false, context)` once. `:33` calls `api.loadPreview(context.accountId)`. `:38-42` emits `invoice_preview_viewed` only after that call returns. Observed: `evidence/enabled.json:11-43` and `five-states.txt` row `enabled`.
2. **Invalid context.** `invoicePreview.mjs:3-12` requires equal non-empty strings; `:16-18` returns before the evaluation `try`. Observed: `five-states.txt` row `invalid-context` with `evaluations: 0`, empty `apiCalls` and `telemetry`. Empty strings take the same branch (`:9-10`).
3. **Disabled.** `invoicePreview.mjs:27-28` returns after a false evaluation and before `loadPreview`. Observed: `evidence/disabled.json:21-27`.
4. **Provider failure.** `invoicePreview.mjs:23-24` catch returns `flag-evaluation-error` without calling `loadPreview`. Observed: `evidence/provider-error.json:21-27`. Evaluation count is 1 because `configFlagClient.mjs:4` records the call before throwing.
5. **Preview API failure.** `invoicePreview.mjs:33-35` records the failed `loadPreview` then returns `preview-unavailable` without reaching `:38`. Observed: `five-states.txt` row `preview-api-failure` (`apiCalls: [{ accountId: "acct-100" }]`, `telemetry: []`).

## Rollback

Command (drill display form): `node scripts/rollback-invoice-preview.mjs --config <temporary-config> --actor release-engineer --reason "Invoice preview error rate exceeded rollback threshold" --timestamp 2026-08-14T10:30:00.000Z`

- Rollback command exit code: `0` (`evidence/rollback-drill.json` `result: passed`)
- Invalid-input check: `rejected: true`, `configUnchanged: true` (`rollback-drill.json:69-72`). Independent `/tmp` copy: invalid timestamp exit `1`, SHA-256 unchanged at `d24ea840ff3a6e2302fe5e7f8066d99d4539b9ae12f3c428d1e5b324c3dfd77a`. Last validation `rollback-invoice-preview.mjs:64-66`; first mutation `:87`.
- Config digest before: `d24ea840ff3a6e2302fe5e7f8066d99d4539b9ae12f3c428d1e5b324c3dfd77a`
- Config digest after: `3303cee1a8128202dbc09adef17f78dd1f1d0f00b8520328f789e227e7095e97`
- Elapsed: `19.546` ms (`rollback-drill.json:10`), under the 1000 ms objective
- Audit path: `configAfter.lastRollback` with `actor`, `reason`, `timestamp`, `previousRevision: "rollout-2026-08-14"` (`rollback-drill.json:29-34`)
- Revision: `rollback-2026-08-14T10-30-00-000Z` from `rollback-invoice-preview.mjs:73`

Protected `config/invoice-preview.json` SHA-256 after all local drills: `d24ea840ff3a6e2302fe5e7f8066d99d4539b9ae12f3c428d1e5b324c3dfd77a` (unchanged).

## Specialist review (integration owner re-derived each claim)

Flag-boundary lane ([Flag side-effect reviewer](ac6ce720-49e6-4658-9589-869ca6230eb6)): PASS, no defects. Dismissed fail-open leftover against `invoicePreview.mjs:20,22`; dismissed disabled-path side effects against `:27-28`; dismissed telemetry-before-success against `:32-42`.

Rollback lane ([Rollback atomicity reviewer](7cb6f0e4-ce52-4b5c-8ce0-a4458f6f68ba)): PASS, no defects. Dismissed mutate-then-validate against `:26-66` vs `:87`; dismissed `Date.parse` looseness as out of gate (`:46-48` rejects `not-a-timestamp` and accepts the drill timestamp).

No specialist finding was accepted as a code change. No finding was rejected; there were no defects to reject.
