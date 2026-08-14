# Network boundary coverage

Date: 2026-08-14. All six state tests are in `case-dashboard-app/src/App.network.test.tsx`, render `App`, control `http.get("/api/cases")` with `server.use`, and assert through Testing Library's public UI queries.

| State or boundary | Exact test/configuration | Handler, user action, and assertion |
| --- | --- | --- |
| Loading | `announces loading while GET /api/cases is pending` | The GET handler uses infinite delay; `getByRole("status")` contains `Loading cases...`. |
| Success | `shows case details returned by GET /api/cases` | The GET handler returns CASE-104; the assertions find `Northstar Health`, the summary, and case ID. |
| Server-empty | `shows the server-empty message for an empty response` | The GET handler returns `[]`; the assertion finds `No cases are assigned yet.` and no Cases list. |
| Filtered-empty | `shows a filtered-empty message without sending another request` | After one successful GET, the user types `unknown customer`; the assertion finds the match-specific message, rejects server-empty, and proves the request count remains 1. |
| Request error | `shows an alert and Retry action when the request fails` | The GET handler returns 503; the assertions find the alert text and the Retry button. |
| Retry recovery | `sends exactly one retry request and recovers` | The initial GET returns 503, the user selects Retry, the second GET returns CASE-220; assertions cover loading, `Recovered Co`, and exactly 2 total requests. |
| Strict unhandled requests | `src/test/setup.ts` | `server.listen({ onUnhandledRequest: "error" })` makes any request outside the declared test boundary fail the test instead of warning or reaching the network. |
| Runtime handler reset | `src/test/setup.ts` and `npm run test:network` | `afterEach` calls `server.resetHandlers()` and `cleanup()`; all 12 tests pass in shuffled orders for seeds 104, 108, and 220, proving test isolation. |

