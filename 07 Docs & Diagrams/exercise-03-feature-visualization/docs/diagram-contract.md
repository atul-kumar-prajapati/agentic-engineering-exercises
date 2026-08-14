# Payment Diagram Contract

Create these Mermaid files:

- `payment-architecture.mmd` starts with `flowchart LR`. Use `CheckoutUI`, `Orchestrator`, `GatewayAdapter`, `LedgerRecord`, `ReceiptRecord`, and `WebhookHandler`. Show only implemented dependencies.
- `webhook-reconciliation-state.mmd` starts with `stateDiagram-v2`. Show signature check, reference check, duplicate check, rejected, ledger-recorded, already-handled, and handled outcomes. Do not add retry.
- `payment-sequence.mmd` starts with `sequenceDiagram`. Use `Shopper`, `CheckoutUI`, `Orchestrator`, `GatewayAdapter`, `Ledger`, `ReceiptNotifier`, and `WebhookHandler`. Show approved and declined checkout, then first and duplicate webhook delivery.
- `payment-data.mmd` starts with `erDiagram`. Use only `CUSTOMER`, `CHECKOUT_ORDER`, `ORDER_ITEM`, `PAYMENT_METHOD`, `PAYMENT_INTENT`, `GATEWAY_TRANSACTION`, `LEDGER_ENTRY`, `WEBHOOK_EVENT`, and `RECEIPT`.

In the architecture diagram, write dependencies as simple `Alias --> Alias` lines. In the state diagram, use these aliases exactly: `received`, `signature_check`, `reference_check`, `duplicate_check`, `rejected`, `ledger_recorded`, `already_handled`, and `handled`.

Add `%% EDGE: VIS-<number>` immediately before every required relationship represented in a diagram.

| IDs | Relationship | Required diagrams |
| --- | --- | --- |
| VIS-01 | Checkout UI calls the orchestrator | architecture, sequence |
| VIS-02 | Orchestrator authorizes through the gateway adapter | architecture, sequence |
| VIS-03 | Orchestrator captures through the gateway adapter | architecture, sequence |
| VIS-04 | Orchestrator creates ledger records | architecture, sequence |
| VIS-05 | Orchestrator creates receipt status | architecture, sequence |
| VIS-06 | Gateway adapter creates a webhook event | architecture, sequence |
| VIS-07 | Webhook handler writes one ledger record | architecture, state, sequence |
| VIS-08 | Invalid signature is rejected | state, sequence |
| VIS-09 | Unknown gateway reference is rejected | state, sequence |
| VIS-10 | Duplicate event returns already-handled | state, sequence |
| VIS-11 | A recorded event is marked handled | state, sequence |
| VIS-12 | Payment intent references its order | data |
| VIS-13 | Gateway transaction references its intent | data |
| VIS-14 | Ledger entry references its intent | data |
| VIS-15 | Webhook event references a gateway transaction | data |
| VIS-16 | Receipt references its order | data |
