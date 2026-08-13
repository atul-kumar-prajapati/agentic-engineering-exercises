# Exercise 02 : TDD Skill Network Boundary Rescue

## Your Mission

Your mission is to repair a network-backed case dashboard through genuine test-first cycles.

The supplied test passes, but loading feedback is missing, an empty filter is reported as an empty server, Retry never sends another request, and the test network setup allows hidden request and handler leaks.

Use the TDD skill to complete one user-visible behaviour at a time through the real `GET /api/cases` boundary.

Compare the agent's implementation before and after using the skill.

The duration for this challenge is 45 min or less.

## Project

[case-dashboard-app](./case-dashboard-app) contains the dashboard, MSW network boundary, weak test, and failing acceptance checks.

Use this request for both agent runs:

> Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.

Run the weak test and failing acceptance checks before changing any files.

## How To Go About It

Start a fresh agent session without the TDD skill. Provide the request and repository, save its first implementation and observations, then revert the implementation.

Install the current [TDD skill](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd) using `npx skills add mattpocock/skills --skill tdd`.

Start another fresh session with the skill available. Confirm the public seam, then complete separate red and green cycles for loading, filtered-empty, and retry. Add independent checks for success, server-empty, and request error.

Use MSW at `GET /api/cases`, fail unhandled requests, reset runtime handlers after every test, and assert only user-visible behaviour. Retry must send a new request before recovery.

Run the complete suite in shuffled orders and compare both implementations.

Keep the agent, model, other tools, permissions, prompt, time limit, and first-attempt conditions the same. The TDD skill must be the only changed input. Do not rerun either implementation.

## Evidence

Submit:

- The repaired dashboard, strict test setup, and independent component tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/skill-record.md` identifying the installed skill source, commit, path, and file hash.
- `evidence/tdd-cycles.md` containing each red failure and green result in execution order.
- `evidence/network-boundaries.md` mapping all six states to exact tests and assertions.
- `evidence/comparison.md` explaining the differences between both implementations.
- `evidence/network-run.txt` containing the shuffled stability command, output, and exit code.
- Output from `npm run test:smoke`, `npm run test:acceptance`, `npm run test:network`, `npm run test:tdd`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [network contract](./docs/network-contract.md), [evidence template](./docs/evidence-template.md), and repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The final tests must prove all six states through the real request seam, use user-facing queries, fail unexpected requests, reset handler overrides, and prove Retry sends exactly one new request before recovery.

The exercise is incomplete if the runs are not comparable, red evidence was produced after the implementation, behaviours are completed in one horizontal batch, `fetch` or component internals are mocked, protected inputs are changed, or required evidence is missing.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#tdd-skill-network-boundary-rescue).
