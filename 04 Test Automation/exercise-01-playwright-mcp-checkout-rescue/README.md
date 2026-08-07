# Exercise 01: Playwright MCP Checkout Rescue

## Objective

Stabilize a real checkout flow that includes cart totals, a tax quote, payment authorization, confirmation, and decline recovery.

## Starting Point

The starter is mounted and has three intentional weaknesses: a fixed wait, a selector tied to a generated class, and payment mock state shared across tests. Confirm the stable smoke test before investigating the flaky suite.

## Required Implementation Changes

- Replace fixed waits with observable readiness.
- Replace generated-class selectors with resilient user-facing locators.
- Isolate payment mock state for every test and worker.
- Assert tax and authorization request payloads.
- Cover successful confirmation and decline recovery.

## Allowed Changes

Change `checkout-e2e-app/tests/**`, test fixtures, mock middleware, and narrowly required accessibility hooks in the checkout UI. Do not replace the checkout application or remove decline behavior.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `checkout-e2e-app`:

```text
npm ci
npx playwright install chromium
npm run test:smoke
npm run test:e2e:reproduce
npm run agent:check
```

The reproduction command uses four repeats for a quick investigation loop. Before submission, run the repaired suite with `npx playwright test --repeat-each=20 --workers=2`.

The repeated command is expected to expose the starter failure and must pass after the fix.

## Acceptance Criteria

- The starter smoke remains green.
- No `waitForTimeout` or generated-class locator remains in final checkout coverage.
- Tests pass with `--repeat-each=20 --workers=2`.
- Payment isolation and request payloads are proven, not assumed.
- Confirmation and decline retry are both covered.

## Evidence Contract

Commit `evidence/checkout-rescue.md`, repeated-run console output, and one `trace.zip` for the original failure or final proof. Keep the trace below 10 MB; do not commit the full Playwright report directory.

## Incomplete When

The flow is rewritten to avoid the seeded problem, only a single run is shown, the shared mock remains, payloads are untested, or evidence does not connect failure to root cause.

## Evaluation Rubric

See [Playwright Checkout Rescue](../../docs/EVALUATION_RUBRICS.md#playwright-checkout-rescue).
