# Ordered TDD cycles

Date: 2026-08-14. Public seam for every cycle: rendered user-visible behavior driven through MSW at `GET /api/cases`.

## Cycle 1 Loading

- Test-only diff: created `src/App.network.test.tsx` with only `announces loading while GET /api/cases is pending`; its MSW handler delayed forever and the assertion queried `role="status"` for `Loading cases...`.
- Red command: `npx vitest run src/App.network.test.tsx -t "announces loading while GET /api/cases is pending" --pool=forks --maxWorkers=1`.
- Red result: Exit code: 1. One test failed with `Unable to find an accessible element with the role "status"`.
- Smallest production and harness change: render `<p role="status">Loading cases...</p>` while cases are pending; configure MSW with `onUnhandledRequest: "error"`; after each test call `server.resetHandlers()` and Testing Library `cleanup()`.
- Green command: `npx vitest run src/App.network.test.tsx -t "announces loading while GET /api/cases is pending" --pool=forks --maxWorkers=1`.
- Green result: Exit code: 0. One test passed.

## Cycle 2 Filtered-empty

- Test-only diff: added only `shows a filtered-empty message without sending another request`; it loaded `Northstar Health`, typed `unknown customer`, asserted `requests` stayed at 1, required `No cases match "unknown customer".`, and rejected the server-empty copy.
- Red command: `npx vitest run src/App.network.test.tsx -t "shows a filtered-empty message without sending another request" --pool=forks --maxWorkers=1`.
- Red result: Exit code: 1. The expected match message was absent and the DOM showed `No cases are assigned yet.`; the request-count assertion had passed first.
- Smallest production change: use `No cases match "{query}".` only when the server returned cases but the filter removed all of them.
- Green command: `npx vitest run src/App.network.test.tsx -t "shows a filtered-empty message without sending another request" --pool=forks --maxWorkers=1`.
- Green result: Exit code: 0. One test passed.

## Cycle 3 Retry

- Test-only diff: added only `sends exactly one retry request and recovers`; the handler returned 503 once, delayed the second response, and the UI assertions required the alert, Retry action, renewed loading status, `Recovered Co`, and exactly 2 total requests.
- Red command: `npx vitest run src/App.network.test.tsx -t "sends exactly one retry request and recovers" --pool=forks --maxWorkers=1`.
- Red result: Exit code: 1. Loading appeared after Retry, but `Recovered Co` was never rendered because no second request was sent.
- Smallest production change: invoke the existing `loadCases` callback from the Retry button.
- Green command: `npx vitest run src/App.network.test.tsx -t "sends exactly one retry request and recovers" --pool=forks --maxWorkers=1`.
- Green result: Exit code: 0. One test passed and the handler observed exactly two requests.

## Final review

Independent green characterization checks were added one at a time for success, server-empty, and request error; no further production change was needed. Final review command `npm run test:component` returned Exit code: 0 with 4 files and 12 tests passed. No refactor was needed after review.

