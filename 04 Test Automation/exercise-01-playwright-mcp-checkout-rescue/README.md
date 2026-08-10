# Exercise 01 : Playwright MCP Checkout Rescue

## Your Mission

Your mission is to turn a misleading green checkout test into a reliable test gate.

You are given a real checkout flow with delayed tax, changing CSS classes, shared payment state, decline recovery, and request payload requirements. The supplied smoke test can pass while important behaviour is still broken.

Use Playwright MCP to inspect the live accessibility tree and network behaviour, find the real failure causes, and replace the flaky coverage with independent tests.

The duration for this challenge is 30 min or less.

## Project

[checkout-e2e-app](./checkout-e2e-app) contains the checkout application, API fixture, stable smoke test, and intentionally flaky tests.

## How To Go About It

Configure the official [Playwright MCP server](https://github.com/microsoft/playwright-mcp) for your coding agent. Use accessibility snapshots and network inspection to understand the flow before changing tests.

Keep the application behaviour. Replace fixed waits and generated-class selectors with user-facing locators and observable readiness. Isolate API state per test, prove the tax and authorization payloads, and cover approval, decline, retry, and duplicate-submit protection.

Run the repaired suite twenty times with two workers. Keep a trace from a real failure or final proof.

## Evidence

Submit the repaired tests and fixtures, `evidence/mcp-investigation.md`, `evidence/checkout-rescue.md`, repeated-run output, and one `trace.zip` below 10 MB.

Run `npm run test:smoke`, `npm run test:e2e:reproduce`, `npm run test:submission`, `npm run agent:check`, and `npx playwright test --repeat-each=20 --workers=2` from `checkout-e2e-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that MCP evidence comes from the mounted flow, tests use accessible user-facing locators, and readiness is observed instead of delayed by a fixed time.

Approval and decline tests must be independent, request bodies must be asserted, retry must send a new authorization, and repeated parallel execution must pass.

The exercise is incomplete if checkout is simplified, a single run is shown, shared state remains, payloads are assumed, protected inputs are changed, or required checks fail.

See the [Playwright MCP Checkout Rescue rubric](../../docs/EVALUATION_RUBRICS.md#playwright-mcp-checkout-rescue).
