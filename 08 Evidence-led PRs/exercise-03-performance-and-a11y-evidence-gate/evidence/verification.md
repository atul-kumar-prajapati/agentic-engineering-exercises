# Verification

All commands ran in `quality-gate-app` inside worktree `/tmp/ex-08-03`. Exit codes are from those invocations, not inferred.

Source SHA: `44b789f75fabffb63b664a63b7e6fe7db2e2e054`

## Capture (once)

```text
npm run quality:capture -- --sha 44b789f75fabffb63b664a63b7e6fe7db2e2e054
```

exit=0. Produced `evidence/raw/lighthouse/run-{1,2,3}.json`, `evidence/raw/axe.json`, `evidence/quality-summary.json`, `evidence/comparison.md`. Capture refuses overwrite; it was not run again.

## Script loop

| Script | Exit |
|---|---|
| `test:integrity` | 0 |
| `lint` | 0 |
| `test` | 0 |
| `format` | 0 |
| `typecheck` | 0 |
| `build` | 0 |
| `agent:check` | 0 |
| `quality:verify` | 0 |
| `test:submission` | 0 |
| `verify:implementation` | 0 |
| `verify:submission` | 0 |
| `verify:exercise` | 0 |

`dev` and `preview` were not run (they start servers). `quality:capture` is listed above, not re-run in this loop.

## quality:verify (redirected)

```text
npm run quality:verify > ../evidence/commands/quality-verify.txt
```

exit=0. Output in `evidence/commands/quality-verify.txt`:

```
Source SHA: 44b789f75fabffb63b664a63b7e6fe7db2e2e054
PASS three raw Lighthouse reports use one route and Chrome environment
PASS pessimistic performance, accessibility, LCP, and axe thresholds met
PASS raw artifact SHA-256 digests and generated comparison verified
PASS performance and axe negative controls return non-zero with failed decisions
PASS Git source binding and evidence-only follow-up history verified
```

## Negative controls on captured reports

| Case | Exit | Decision | Failures |
|---|---|---|---|
| Unmutated captured reports | 0 | passed | [] |
| `run-1.json` performance set to 0.89 | 1 | failed | performance below minimum |
| axe `violations` plus `button-name` | 1 | failed | axe violations above maximum |

`verify:exercise` is re-run after the evidence commit; that later exit code is recorded in `evidence/guardrails.md` if it differs, otherwise it remains 0.
