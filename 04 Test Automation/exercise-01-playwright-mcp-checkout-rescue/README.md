# Exercise 01 : Playwright MCP Checkout Rescue

## Your Mission

Your team cannot trust its checkout release because a green browser test passes once but fails under repetition and parallel execution. Your mission is to replace the misleading test with a reliable gate based on observed browser behavior.

The checkout has delayed tax, generated CSS classes, server-side payment state, and strict request contracts. The current test hides race conditions, shares state, and proves only one happy path.

Use Playwright MCP to investigate the live flow, then prove whether that evidence improves the same agent's first test implementation.

The duration for this challenge is 45 min or less.

## Project

[checkout-e2e-app](./checkout-e2e-app) contains the checkout flow, API fixture, smoke test, and unreliable browser coverage.

Use this production request in both agent sessions:

> Replace the flaky checkout coverage with an independent test gate for approval, decline recovery, retry, and duplicate-submit protection. Verify the tax and authorization payloads without changing application behaviour.

Reproduce the unreliable behavior before changing the tests.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the test implementation produced in the first branch.

2. In the first branch, start a fresh agent session without Playwright MCP. Give it the request exactly as written. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Configure the official [Playwright MCP server](https://github.com/microsoft/playwright-mcp). Review the first result and the [checkout contract](./docs/checkout-contract.md).

4. In the second branch, start the application and a fresh agent session with Playwright MCP. Before editing tests, capture accessibility snapshots before and after tax readiness, inspect tax and authorization requests, and exercise approval, decline, retry, and duplicate submission.

5. Use the observed evidence to build independent tests with user-facing locators and observable readiness. Isolate server state, assert request bodies and outcomes, and remove fixed waits and generated-class selectors.

6. Use the same agent, model, other tools, permissions, time limit, and first-attempt condition. Playwright MCP must be the only changed tool. Run the repaired suite twenty times with two workers and retain a trace.

7. Save `evidence/after.md`, `evidence/after.patch`, `evidence/mcp-investigation.md`, `evidence/test-matrix.md`, `evidence/repeat-run.txt`, and `evidence/comparison.md`. Raise the final PR only from the second branch.

## Evidence

Submit:

- The repaired checkout tests and fixtures.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/mcp-investigation.md`, `evidence/test-matrix.md`, and `evidence/comparison.md`.
- `evidence/repeat-run.txt` with the twenty-repeat, two-worker result.
- `evidence/trace.zip` from the repaired suite, below 10 MB.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, the complete browser suite, live-flow proof, repeated parallel execution, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both sessions use the same request and working conditions except Playwright MCP.
- Live MCP evidence records accessible readiness states and the tax and authorization requests used to design the tests.
- Independent tests prove approval, decline recovery, retry, duplicate-submit protection, request bodies, and isolated server state.
- No fixed waits, generated-class selectors, or application behavior changes are used to force a pass.
- The twenty-repeat, two-worker run and `npm run verify:exercise` pass, with all required proof in the PR.
