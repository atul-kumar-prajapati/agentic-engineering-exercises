# Verification

All commands ran in `legacy-rules-app` unless noted. JAVA_HOME=`/Users/codewalnut/Library/Java/JavaVirtualMachines/ms-25.0.4/Contents/Home` (Microsoft OpenJDK 25 compiling `--release 21`). Citation tree: working tree `/tmp/ex-11-03` / Git SHAs below. No bundle.

| Script | Exit |
|---|---|
| `npm run test:integrity` | 0 |
| `npm run lint` | 0 |
| `npm run test` | 0 |
| `npm run format` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm run test:rules` (`./mvnw test` 15 tests + client contract) | 0 |
| `npm run refactor:verify` | 0 |
| `npm run verify:implementation` | 0 |
| `npm run verify:submission` | 0 |
| `npm run agent:check` | 0 |
| `npm run verify:exercise:core` | 0 |
| `npm run verify:exercise` | 0 (see guardrails: Surefire reports redirected off-tree) |

Broken-state tool: unconstrained commit `ab44994` `./mvnw test` exit 1 (6 testCompile constructor-arity errors). Fixed-state tool: after `45238cc` `./mvnw test` exit 0 (15 tests) and `npm run test:rules` exit 0.

`evidence/commands/rules-verify.txt` captures `npm run refactor:verify` with Characterization SHA, Refactor SHA, PASS, and exit code: 0.
