# Before and after comparison

Run conditions matched: Cursor Grok 4.6 (`cursor-grok-4.6-high`), file and shell tools, isolated worktrees from starting commit `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, 45-minute limit, first attempt, 0 hints, 0 retries. The only intended difference is that the after session received the flag, rollback, and evidence contracts.

Patches: `evidence/before.patch` (ordinary) and `evidence/after.patch` (evidence-led). Generated proof binds to source SHA `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`.

| Measure | Ordinary before `a9d966b904f1758d11cde4cbf5d2bc4f13ed95bd` | Evidence-led after `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1` |
|---|---|---|
| `npm run test:rollout` | exit 1 (3 fail) | exit 0 (6 pass) |
| Enabled API / telemetry | 1 / 1 | 1 / 1 (`evidence/enabled.json:29-43`) |
| Disabled API / telemetry | 0 / 0 | 0 / 0 (`evidence/disabled.json:25-26`) |
| Provider-error reason | `provider-error` (`invoicePreview.mjs:29` on before) | `flag-evaluation-error` (`invoicePreview.mjs:24`; `evidence/provider-error.json:23`) |
| Invalid context | preview + 1 API + 1 telemetry (`before invoicePreview.mjs:7-8` skips equality) | legacy `invalid-context`, 0 eval, 0 API, 0 telemetry (`after invoicePreview.mjs:11,16-18`) |
| API-failure reason | `api-error` (`before invoicePreview.mjs:40`) | `preview-unavailable` (`after invoicePreview.mjs:35`) |
| Targeting key on eval | passed through | unchanged `acct-100` / `acct-999` (`enabled.json:7-9`, `disabled.json:7-9`) |
| Default value | `false` | `false` (`enabled.json:14`) |
| Invalid timestamp rollback | exit 0, digest changed | exit 1, digest unchanged (`rollback-drill.json:69-72`) |
| Rollback revision | `rollback-2026-08-14T10:30:00.000Z` | `rollback-2026-08-14T10-30-00-000Z` (`rollback-drill.json:28`) |
| Audit shape | `audit` object, no `lastRollback` | `lastRollback.{actor,reason,timestamp,previousRevision}` (`rollback-drill.json:29-34`) |
| Files changed | 2 (`+264 / -11`) | 2 (`+132 / -11`) |
| Elapsed rollback | not measured (unsafe CLI) | 19.546 ms (`rollback-drill.json:10`) |

## Conclusion

The ordinary attempt failed closed on disabled and empty-context paths and emitted the right enabled telemetry, but it still served preview for mismatched targeting keys, used the wrong legacy reason tokens, and mutated configuration on invalid rollback input. The evidence-led attempt produced one evaluation with default `false` on every valid request, confined preview API and `invoice_preview_viewed` to the enabled success path, and validated rollback input before the first `writeFileSync`. Generated artifacts `enabled.json`, `disabled.json`, `provider-error.json`, `rollback-drill.json`, and `rollback-drill.md` all record source SHA `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`. Invalid context and API failure are not in the capture-script trio; they are proved separately in `evidence/commands/five-states.txt` and `scripts/run-rollout-tests.mjs:31-47`.
