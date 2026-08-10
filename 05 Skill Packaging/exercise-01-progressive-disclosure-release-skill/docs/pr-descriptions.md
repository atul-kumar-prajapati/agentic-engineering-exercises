# Merged Pull Request Context

These descriptions supplement, but do not replace, the Git history in `fixtures/release-history.bundle`.

## PR 41: Checkout retry and clearer declines

Adds a retry path after declined cards. Customer-facing behavior is covered by checkout tests, but the browser screenshot is missing.

## PR 42: Billing export compatibility

Renames the exported `invoiceTotal` field to `total`. This is a breaking API change and requires a migration note. Contract verification passed.

## PR 43: Internal telemetry cleanup

Refactors internal event names without changing the customer contract. This must not appear as a customer-facing release item.
