# Protected Test Boundary

The product contract contains six distinct user-visible states:

1. Loading while `GET /api/cases` is pending.
2. Success with returned cases.
3. Server-empty when the API returns an empty list.
4. Filtered-empty when loaded cases do not match the user's query.
5. Error when the request fails.
6. Retry that sends a new request and recovers.

Tests must fail unexpected network requests and reset runtime handler overrides after every test. The supplied acceptance test protects the seeded retry behavior, but it does not replace the participant's TDD cycles or coverage for all six states.
