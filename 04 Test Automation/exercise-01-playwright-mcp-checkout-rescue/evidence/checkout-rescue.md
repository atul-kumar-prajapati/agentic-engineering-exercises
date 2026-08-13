# Checkout rescue verification

Date: 2026-08-13

## What changed

The flaky checkout coverage was replaced by three independent tests. Every test resets `/api/testing/reset`, waits on accessible readiness, and uses user-facing roles and labels. Authorization responses are isolated per test so parallel workers cannot consume shared fixture state.

The tests prove:

- the exact tax request and the resulting `106.92` total;
- approval payload and confirmation authorization;
- decline payload, accessible recovery, and a second fresh approval request;
- the `Authorizing...` disabled state and exactly one request while payment is pending.

`fullyParallel: true` makes the requested parallel intent explicit. Application behavior and protected challenge inputs remain unchanged.

## Root cause resolution

The root cause was false readiness plus shared state: fixed time and a generated class were unrelated to tax completion, while the fixture's process-wide counter made results depend on scheduling. Web-first assertions now observe readiness, and route-local authorization fixtures remove that scheduling dependency while preserving request-boundary proof.

## Final repeated proof

Command:

```text
npx playwright test --repeat-each=20 --workers=2
```

Workstation note: `PLAYWRIGHT_EXECUTABLE_PATH` pointed to installed Google Chrome because the one-time Playwright Chromium download remained stalled. The committed config uses this override only when the environment variable is explicitly present; normal runs use Playwright Chromium.

Result: exit code 0; 80 passed using 2 workers in 1.3 minutes. Output is retained in `evidence/repeated-run.txt`.

Trace command:

```text
npx playwright test tests/e2e/flaky-checkout.spec.ts -g "approves checkout" --workers=1 --trace=on --reporter=line
```

Result: exit code 0; 1 passed. The final proof is `evidence/trace.zip` (70,378 bytes, below 10 MB).

## Required command results

All commands ran from `checkout-e2e-app` on 2026-08-13.

| Command | Result |
| --- | --- |
| `npm run test:smoke` | Exit code 0; 1 passed |
| `npm run test:e2e:reproduce` | Exit code 0; 12 passed using 2 workers |
| `npm run test:submission` | Exit code 0; submission verifier passed |
| `npm run agent:check` | Exit code 0; integrity (4 protected inputs), lint, agent check, format, typecheck, and build passed |
| `npx playwright test --repeat-each=20 --workers=2` | Exit code 0; 80 passed using 2 workers |

An earlier reproduce attempt was interrupted when the separately mounted investigation server reached its host-imposed lifetime and closed, producing `ERR_CONNECTION_REFUSED`. It was rerun with a fresh mounted server; the complete required run above passed 12/12. This was an infrastructure interruption, not a retried product assertion.
