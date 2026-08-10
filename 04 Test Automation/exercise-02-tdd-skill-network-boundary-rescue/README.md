# Exercise 02 : TDD Skill Network Boundary Rescue

## Your Mission

Your mission is to repair a case dashboard by working in strict red, green, refactor cycles.

You are given one weak green test, a retry path that does not send a second request, and network handlers that leak between tests. A large test written after the fix can easily miss these problems.

Use the TDD skill to build one user-visible behaviour at a time through the real `GET /api/cases` boundary.

The duration for this challenge is 30 min or less.

## Project

[case-dashboard-app](./case-dashboard-app) contains the dashboard, MSW boundary, weak test, and seeded retry defect.

## How To Go About It

Install the [TDD skill](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd):

```bash
npx skills add https://github.com/mattpocock/skills --skill tdd
```

Start with a failing test for one behaviour, make the smallest production change that passes, then refactor. Repeat for loading, success, server-empty, filtered-empty, error, and retry.

Make unhandled requests fail and reset handlers after every test. Tests must use public UI seams and prove retry sends a new request and recovers.

## Evidence

Submit the tests and fix, `evidence/tdd-cycles.md` with each red and green command, `evidence/red.patch`, `evidence/green.patch`, and `evidence/network-boundaries.md` mapping the six states to test names.

Run `npm run test:smoke`, `npm run test:component`, `npm run test:submission`, and `npm run agent:check` from `case-dashboard-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that production changes follow observed failing tests, each cycle is small, and assertions describe what a user sees.

All six states must be independent. Unexpected requests must fail, handler changes must not leak, and retry must issue a fresh request before recovery.

The exercise is incomplete if evidence is recreated after coding, the request boundary is bypassed, implementation details are asserted, protected inputs are changed, or required checks fail.

See the [TDD Skill Network Boundary Rescue rubric](../../docs/EVALUATION_RUBRICS.md#tdd-skill-network-boundary-rescue).
