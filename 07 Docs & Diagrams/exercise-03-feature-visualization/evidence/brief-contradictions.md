# Brief Contradiction Review

Each legacy brief claim was verified against the implementation, the feature tests, and the protected incident before any diagram decision was made.

## BRIEF-01

Claim: The checkout application calls an external gateway service directly.
Result: rejected
Source: `payment-workflow-app/src/App.tsx:6` calls `runPaymentScenario()` in `payment-workflow-app/src/payment/paymentOrchestrator.ts:19`, and the only gateway calls are `authorizePayment` (`paymentOrchestrator.ts:27`) and `capturePayment` (`paymentOrchestrator.ts:60`) made by the orchestrator through the gateway adapter. No checkout UI code references the gateway.
Diagram decision: `payment-architecture.mmd` shows `CheckoutUI --> Orchestrator --> GatewayAdapter` only; no direct `CheckoutUI --> GatewayAdapter` edge is drawn.

## BRIEF-02

Claim: A declined authorization is retried once before the order fails.
Result: rejected
Source: `paymentOrchestrator.ts:36-58` marks the order `payment_failed` and blocks the receipt on the first decline; `npm run test:payments` asserts "declined authorization does not capture" with `capture === undefined`. No retry path exists in the source.
Diagram decision: `payment-sequence.mmd` shows a single `alt Authorization approved / else Authorization declined` block with an immediate failure branch and no retry message.

## BRIEF-03

Claim: Any correctly signed capture webhook belongs to a known payment.
Result: rejected
Source: `payment-workflow-app/src/payment/webhookReconciler.mjs:4` rejects references absent from `knownGatewayReferences` after signature validation; `npm run test:webhooks` asserts "unknown gateway reference is rejected without mutation" and "reference ownership is checked before duplicate status". The incident confirms a valid signature alone proves nothing about ownership.
Diagram decision: `webhook-reconciliation-state.mmd` contains `reference_check --> rejected : unknown reference`, and `payment-sequence.mmd` shows the unknown-reference rejection before any duplicate handling.

## BRIEF-04

Claim: Every valid capture delivery creates a new ledger entry.
Result: rejected
Source: `webhookReconciler.mjs:5` returns `already-handled` when `handledEventIds` contains the event ID, before `webhookReconciler.mjs:6` writes a ledger entry; `npm run test:webhooks` asserts "duplicate event is idempotent" keeps exactly one entry. The protected incident records the double ledger posting of `evt_capture_1` that this guard repairs.
Diagram decision: `webhook-reconciliation-state.mmd` routes duplicates to `already_handled` instead of `ledger_recorded`, and `payment-sequence.mmd` separates `alt First delivery / else Duplicate delivery`.
