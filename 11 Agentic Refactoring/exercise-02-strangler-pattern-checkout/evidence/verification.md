# Verification

All commands ran in
`/tmp/ex-11-02/11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app`
while `HEAD` was `58878e4215a164c7a445bd4399118625e894d5e3` (`sourceSha`), with evidence files present in the working tree.

Citation tree for implementation: that commit / working tree. Protected scripts and fixtures: same bytes as `52090edddf032d026ece16ef90feb627bf8e67ac`.

## Tool against broken vs fixed

| Tree | Command | Exit |
|---|---|---|
| Starting `52090ed` (no `cardCheckout.mjs`) | `npm run test:checkout` | 1 at `run-checkout-tests.mjs:10` — see `commands/checkout-broken.txt` |
| Source `58878e42` | `npm run test:checkout` | 0 — see `commands/checkout-fixed.txt` |

## Package.json scripts

| script | exit |
|---|---|
| test:integrity | 0 |
| lint | 0 |
| test | 0 |
| format | 0 |
| typecheck | 0 |
| build | 0 |
| test:checkout | 0 |
| strangler:verify | 0 |
| test:submission | 0 |
| agent:check | 0 |
| verify:implementation | 0 |
| verify:submission | 0 |
| verify:exercise:core | 0 |
| verify:exercise | 0 |

`commands/strangler-verify.txt` contains `Source SHA: 58878e4215a164c7a445bd4399118625e894d5e3`, `PASS`, and `exit code: 0`.

`verify:exercise` is re-run after the evidence commit; that result is recorded in `guardrails.md` together with the porcelain and protected-restore checks.

## After evidence commit

`HEAD` `162036953370de9a34ba40bf8b8388481894fa37` (`evidence: record strangler route matrix, comparison, and guardrails`). Parent is still sourceSha `58878e4215a164c7a445bd4399118625e894d5e3`.

```bash
cd "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app"
npm run verify:exercise
```

Exit code: **0**. Source SHA reported: `58878e4215a164c7a445bd4399118625e894d5e3`. `git diff --name-only 58878e4215a164c7a445bd4399118625e894d5e3 HEAD` lists only `evidence/` files.
