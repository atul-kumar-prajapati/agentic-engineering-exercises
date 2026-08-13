# Exercise 01 : Playwright MCP Checkout Rescue

## Your Mission

Your mission is to replace a misleading green checkout test with a reliable browser test gate.

The checkout uses delayed tax, generated CSS classes, server-side payment state, and strict request contracts. A previous single run was marked complete, but repetition and parallel execution expose failures.

Use Playwright MCP to inspect the live accessibility and network behaviour before repairing the tests.

Compare the agent's test implementation before and after using MCP evidence.

The duration for this challenge is 45 min or less.

## Project

[checkout-e2e-app](./checkout-e2e-app) contains the checkout flow, API fixture, smoke test, and unreliable coverage.

Use this request for both agent runs:

> Replace the flaky checkout coverage with an independent test gate for approval, decline recovery, retry, and duplicate-submit protection. Verify the tax and authorization payloads without changing application behaviour.

The smoke test proves only one happy path. Reproduce the failure before changing the tests.

## How To Go About It

Configure the official [Playwright MCP server](https://github.com/microsoft/playwright-mcp) for your coding agent.

Start a fresh agent session without Playwright MCP. Provide the request and repository, save the first test implementation and observations, then revert the implementation.

Start the application and use Playwright MCP in another fresh session. Capture accessibility snapshots before and after tax readiness, inspect the tax and authorization network requests, and exercise approval, decline, retry, and duplicate submission.

Use the MCP evidence to replace fixed waits and generated-class selectors with user-facing locators and observable readiness. Isolate server state for every test and verify request bodies and outcomes.

Run the repaired suite twenty times with two workers and retain a trace from the final tests.

Keep the agent, model, permissions, prompt, time limit, and first-attempt conditions the same. Playwright MCP must be the only changed tool. Do not rerun either implementation.

## Evidence

Submit:

- The repaired checkout tests and fixtures.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/mcp-investigation.md` containing the MCP tools, accessibility states, network requests, and observed results.
- `evidence/test-matrix.md` mapping each required behaviour to its test and assertion.
- `evidence/comparison.md` explaining what improved.
- `evidence/repeat-run.txt` containing the twenty-repeat, two-worker command, output, and exit code.
- `evidence/trace.zip` from the repaired suite, below 10 MB.
- Output from `npm run test:smoke`, `npm run test:e2e:reproduce`, `npm run test:checkout`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [checkout contract](./docs/checkout-contract.md), [evidence template](./docs/evidence-template.md), and repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

MCP evidence must come from the live flow and show the accessible readiness states and full tax and authorization request details.

The repaired tests must use user-facing locators, isolate server state, assert request bodies, cover approval and decline independently, prove retry sends a new authorization, and prove duplicate submission sends only one authorization.

The exercise is incomplete if the runs are not comparable, application behaviour is changed, fixed waits or generated-class selectors remain, the repeated parallel run fails, protected inputs are changed, or the required evidence is missing.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#playwright-mcp-checkout-rescue).
