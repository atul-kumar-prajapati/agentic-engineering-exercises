# Case Dashboard Network Contract

Status: Approved
Owner: Support Operations

## Request boundary

The dashboard loads cases only through `GET /api/cases`. Tests must exercise this request with MSW. Do not mock `fetch`, React state, or component internals.

Runtime MSW handlers may change a response for one test. Unhandled requests must fail and handler overrides must reset after every test.

## User-visible behaviour

- Loading: `Loading cases...` is announced while the request is pending.
- Success: returned case details are displayed.
- Server-empty: an empty response displays `No cases are assigned yet.`
- Filtered-empty: loaded cases with no query match display `No cases match "<query>".`
- Request error: a non-success response displays an alert and Retry action.
- Retry: selecting Retry sends exactly one new `GET /api/cases`, shows loading again, and can recover with returned cases.

The initial request and retry count as two requests. A filter change must not make another network request.

## Seeded defects

The weak test covers only success. The starter implementation is missing loading feedback, confuses filtered-empty with server-empty, and clears an error on Retry without issuing a request.
