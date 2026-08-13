# Playwright MCP Checkout Rescue Evidence

Replace every prompt with observed information. Do not report a command as passing unless captured output proves it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Other tools: [enabled tools excluding Playwright MCP]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Replace the flaky checkout coverage with an independent test gate for approval, decline recovery, retry, and duplicate-submit protection. Verify the tax and authorization payloads without changing application behaviour.
- Attempt: 1
- Context source: [repository inspection or live Playwright MCP evidence]
- Playwright MCP: [disabled or enabled]

### Investigation and decisions

Record the observed failure, files inspected, assumptions, and test strategy.

### Verification

Record every command, exit code, and relevant output.

## mcp-investigation.md

Record the Playwright MCP configuration and exact `browser_snapshot`, `browser_network_requests`, and `browser_network_request` calls used.

For each observation, include the live URL, relevant accessibility or request output, and the conclusion used in the tests. Cover tax loading and readiness, authorization pending, approval, decline, retry, and duplicate submission.

## test-matrix.md

Map tax payload, authorization payload, approval, decline, retry, duplicate submission, and per-test isolation to the exact test and assertion that proves it.

## comparison.md

Compare failure diagnosis, locator strategy, waiting strategy, network assertions, isolation, behavioural coverage, repeated-run result, and changed files. Explain why both first attempts used fair conditions.
