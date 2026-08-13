# Duplicate Webhook Incident

The gateway delivered the same `payment.captured` event twice after a timeout. Both deliveries had a valid signature. Reconciliation created two capture ledger records for one gateway reference.

The repair must preserve valid signature checks, reject unknown gateway references, and return an idempotent result for an already handled event. Diagrams must show where the idempotency decision happens and which records supply the lookup keys.
