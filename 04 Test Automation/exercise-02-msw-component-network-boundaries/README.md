# Exercise 02: MSW Component Network Boundary Tests

## Objective

Strengthen component coverage for the mounted case dashboard at the real `GET /api/cases` boundary.

## Starting Point

The dashboard already renders loading, success, server-empty, filtered-empty, error, and retry behavior. MSW and one intentionally weak success test are supplied. The starter setup warns on unhandled requests and does not reset handlers.

## Required Implementation Changes

- Add focused tests for all six UI states.
- Make server-empty and filter-empty assertions use distinct messages.
- Prove retry issues a new request and recovers.
- Change MSW to fail on unhandled requests.
- Reset handlers after every test and prevent state leakage.

## Allowed Changes

Change component tests, `src/test/**`, and narrowly required dashboard accessibility or state code. Do not replace `fetch` with an in-memory repository or remove `GET /api/cases`.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `case-dashboard-app`:

```text
npm ci
npm run test:smoke
npm run test:component
npm run agent:check
```

## Acceptance Criteria

- Loading, success, server-empty, filtered-empty, error, and retry are independently asserted.
- An unexpected request fails a test.
- A handler override cannot leak into the following test.
- Retry visibly recovers from a server failure.
- Tests assert user-observable states rather than implementation details.

## Evidence Contract

Commit tests and `evidence/msw-boundaries.md` with command output and a table mapping each required state to its test name. Evidence must note strict unhandled-request and reset behavior.

## Incomplete When

The real request boundary is bypassed, empty states share one ambiguous assertion, retry is not exercised, handlers leak, or only the supplied weak test passes.

## Evaluation Rubric

See [MSW Network Boundaries](../../docs/EVALUATION_RUBRICS.md#msw-network-boundaries).
