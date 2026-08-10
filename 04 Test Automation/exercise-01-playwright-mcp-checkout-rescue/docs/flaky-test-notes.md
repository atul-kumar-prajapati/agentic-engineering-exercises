# Previous Checkout Test Notes

The previous agent ran the smoke test once and marked checkout complete. That result proves only that the mounted happy path passed with the API counter in its initial state.

Known investigation clues:

- Tax responds after a delay, so the Pay button is not immediately ready.
- The primary-button class is generated at runtime.
- The local payment fixture declines card numbers ending in `0000` and every third authorization.
- `/api/testing/reset` resets the shared authorization counter.
- Product acceptance also requires tax and authorization request-body checks, decline recovery, and protection against duplicate submission.

Do not turn these clues into fixed delays or test-order assumptions. Use the live page and network traffic to identify observable boundaries.
