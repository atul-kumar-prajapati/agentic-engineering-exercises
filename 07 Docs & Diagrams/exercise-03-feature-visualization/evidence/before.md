# Before: Brief-Led First Attempt

## Session conditions

- Agent: opencode (CLI coding agent), model `opencode-go/glm-5.3`, same session type as the after attempt.
- Tools: file read/write plus bash; no network tools used.
- Permissions: local repository only; no global installs.
- Time limit: single sitting under the exercise's 45-minute target.
- First-attempt rule: one uninterrupted pass, no hints, no corrections, no retries.
- Inputs provided: `docs/payment-feature-brief.md` and a plain request to visualize the payment feature. The incident report, the diagram contract, the verifier scripts, and the source code were not consulted for this attempt.

## What was produced

Four Mermaid diagrams (architecture, state, sequence, data) in `diagrams/`, committed as a genuine first pass on branch `codex/exercise-07-03-feature-visualization-before` (see `before.patch`). The diagrams faithfully reproduce the legacy brief's four claims.

## Defect results

The seeded duplicate-capture defect was not found and not fixed: the brief-led session had no reason to question the reconciler, because the brief asserts that every valid capture delivery creates a new ledger entry. `webhookReconciler.mjs` was left untouched, so duplicate delivery still double-posts the ledger and unknown gateway references are still accepted.

## Unsupported relationships shown

- `CheckoutUI --> GatewayAdapter` direct call (BRIEF-01, unsupported).
- A one-shot retry of a declined authorization (BRIEF-02, unsupported).
- Signature validity treated as proof of payment ownership (BRIEF-03, unsupported).
- Every webhook delivery writing a new ledger entry (BRIEF-04, unsupported post-incident).

## Parser result

The four files were written as plain Mermaid without contract markers; no `npm run diagrams:parse` run was recorded for this attempt (the command was not part of the brief-led session's instructions).

## Changed files

- `diagrams/payment-architecture.mmd`
- `diagrams/webhook-reconciliation-state.mmd`
- `diagrams/payment-sequence.mmd`
- `diagrams/payment-data.mmd`
