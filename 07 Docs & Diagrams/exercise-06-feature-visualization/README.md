# Exercise 06 : Payment Retry Visualization and Fix

## Your Mission

Your mission is to expose and repair a duplicate-payment risk by visualizing the real payment workflow.

You are given authorization, capture, ledger, receipt, and webhook code. The webhook reconciler records the same captured event twice and the original feature brief does not explain idempotency or invalid signatures.

Create the diagrams needed to reason about the incident, fix the reconciliation boundary, and verify that the diagrams still match the corrected code.

The duration for this challenge is 30 min or less.

## Project

[payment-workflow-app](./payment-workflow-app) contains the payment implementation. [duplicate webhook incident](./docs/duplicate-webhook-incident.md) defines the failure to investigate.

## How To Go About It

Trace the happy path, declined authorization, invalid signature, repeated webhook, and rollback implications. Produce architecture, state/process, sequence, and data-relationship diagrams in Mermaid or Excalidraw source format.

Fix duplicate reconciliation without weakening signature validation. Add a traceability file that maps every failure edge and data relationship to code or tests.

## Evidence

Submit the fix and tests, four source diagrams under `diagrams/`, `evidence/traceability.md`, and `evidence/diagram-verification.md` with render output.

Run `npm run test:webhooks`, `npm run test:submission`, and `npm run agent:check` from `payment-workflow-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check authorization, capture, decline, signature failure, duplicate delivery, ledger, receipt, and webhook relationships in both code and diagrams. Repeated events must be idempotent.

The exercise is incomplete if diagrams show only the happy path, duplicate capture remains possible, signatures are bypassed, or diagram edges lack source evidence.

See the [Payment Retry Visualization and Fix rubric](../../docs/EVALUATION_RUBRICS.md#payment-retry-visualization-and-fix).
