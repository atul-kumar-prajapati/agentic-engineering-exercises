# Exercise 02 : TDD Skill Network Boundary Rescue

## Your Mission

Your team has a green component test but users still see broken loading, empty, error, and retry states. Your mission is to repair the dashboard through genuine test-first cycles across its real network boundary.

The weak test bypasses `GET /api/cases`, hides unexpected requests, and leaks handlers between tests. Retry does not send a new request, and two different empty states are reported as the same result.

Use the TDD skill, then prove whether separate red-green cycles improve the same agent's first implementation.

The duration for this challenge is 45 min or less.

## Project

[case-dashboard-app](./case-dashboard-app) contains the dashboard, MSW network boundary, weak test, and failing acceptance checks.

Use this production request in both agent sessions:

> Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.

Run the weak test and failing acceptance checks before changing any files.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without the TDD skill. Give it the request exactly as written. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Install the current [TDD skill](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd). Review the first result and the [network contract](./docs/network-contract.md).

4. In the second branch, start a fresh session with the skill. Confirm the public seam, then complete separate red-green cycles for loading, filtered-empty, and retry. Add independent tests for success, server-empty, and request error.

5. Exercise the real `GET /api/cases` seam with MSW. Fail unhandled requests, reset runtime handlers after every test, use user-facing assertions, and prove Retry sends exactly one new request before recovery.

6. Use the same agent, model, other tools, permissions, time limit, and first-attempt condition. The TDD skill must be the only changed input. Run the complete suite in shuffled orders.

7. Save `evidence/after.md`, `evidence/after.patch`, `evidence/skill-record.md`, `evidence/tdd-cycles.md`, `evidence/network-boundaries.md`, `evidence/network-run.txt`, and `evidence/comparison.md`. Raise the final PR from the second branch.

## Evidence

Submit:

- The repaired dashboard, strict network setup, and independent tests.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/skill-record.md`, `evidence/tdd-cycles.md`, and `evidence/network-boundaries.md`.
- `evidence/network-run.txt` and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, all six user states, strict network isolation, recorded TDD cycles, shuffled stability, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both sessions use the same request and working conditions except the TDD skill.
- Red evidence exists before production changes for loading, filtered-empty, and retry.
- Tests prove all six states through `GET /api/cases`, fail unexpected requests, and reset handlers after every test.
- Retry sends exactly one new request before recovery, without mocking `fetch` or component internals.
- Shuffled runs and `npm run verify:exercise` pass, with all required proof in the PR.
