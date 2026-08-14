# Duplicate Capture Webhook Incident

The gateway delivered `evt_capture_1` twice after a timeout. Both requests had a valid signature and referenced `gw_approved`. Reconciliation added two capture ledger entries for the same event.

Required behavior:

- Reject an invalid signature before reading or changing reconciliation state.
- Reject a gateway reference not present in `knownGatewayReferences`.
- Return `already-handled` without writing when `handledEventIds` contains the event ID.
- For a new valid event, add one ledger entry, mark the event handled, and return `recorded`.

Do not change the protected cases or weaken any earlier decision to make a later case pass.
