# Verification

Commands below were run from `minimal-diff-app` in `/tmp/ex-10-03` after source commit `71703feac67672c41321f517effd752ef60d0493`. Every "pass" line is an observed exit code: 0, except the seeded broken-state run which is supposed to fail.

## Behavior: export, checkout, delete, unknown

Protected `node ./scripts/run-migration-tests.mjs` (fixed helper):

```
PASS export migrated to ds-secondary
PASS checkout, destructive, and unknown legacy variants remain unchanged
```

exit code: 0

Learner `node ./tests/export-button.test.mjs`: exit code: 0 (export, checkout, delete, unknown).

Independent import probe of seven unique cases (the four named behaviors plus archive, save, and empty string from `run-migration-tests.mjs:7`): exit code: 0.

## Tool against the broken state

Copy of the seeded helper from `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` into a temp tree, then `node ./scripts/run-migration-tests.mjs`: exit 1 at `run-migration-tests.mjs:4` (`actual: 'legacy-primary'`, `expected: 'ds-secondary'`). Export had not migrated.

## Tool against the fixed state

Same protected command on the submitted helper: exit code: 0, both PASS lines above.

## Package.json gates (each run individually)

| script | exit |
|---|---|
| test:integrity | 0 |
| lint | 0 |
| test | 0 |
| format | 0 |
| typecheck | 0 |
| build | 0 |
| test:migration | 0 |
| agent:check | 0 |
| test:scope | 0 |
| test:submission | 0 |
| verify:implementation | 0 |
| verify:submission | 0 |
| verify:exercise | 0 |

`test:scope` stdout is captured in `evidence/commands/scope-verify.txt` and names Plan SHA, Source SHA, Actual scope, and the evidence-only later-history pass.

Integrity reported 18 protected inputs. `git diff --name-only 71703feac67672c41321f517effd752ef60d0493` after the evidence commit must list only `evidence/` paths.
