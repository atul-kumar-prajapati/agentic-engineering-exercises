# Legacy Payment Feature Brief

This brief predates the duplicate-webhook incident. Verify each disputed claim against source and tests.

1. The checkout application calls an external gateway service directly.
2. A declined authorization is retried once before the order fails.
3. Any correctly signed capture webhook belongs to a known payment.
4. Every valid capture delivery creates a new ledger entry.

The feature includes checkout, payment orchestration, authorization, capture, ledger records, receipt status, and webhook reconciliation.
