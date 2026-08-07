# Implementation Plan: Self-Service Subscription Management

## Summary

Evolve the existing read-only React/Vite dashboard into a role-aware management flow backed by a structured subscription-change API. Preserve billing authority outside the client: the application requests previews, confirms them with idempotency and version checks, and renders the resulting request state. Implementation begins only after this specification is approved.

## Technical context

- **Current stack**: React 19, TypeScript 5.9, Vite 7; in-memory seed data and synchronous service helpers.
- **Current entry points**: `src/App.tsx`, `src/types.ts`, `src/data/subscriptions.ts`, and `src/services/subscriptionService.ts`.
- **Testing baseline**: repository scripts verify the exercise contract, formatting, types, and build; feature-level unit/component tests must be added.
- **Constraints**: no client-side price calculation; server-side authorization is required; one pending request per account; date-only billing dates must not shift by browser timezone.

## Constitution/check gates

- Specification includes prioritized, independently testable stories and measurable outcomes: **PASS**.
- Permissions, billing ownership, scheduling rules, conflicts, and failures are explicit: **PASS**.
- Plan is derived from inspected repository files and does not implement the feature: **PASS**.
- Each task maps to a requirement or acceptance scenario and includes verification: **PASS**.

## Proposed architecture

1. **Domain types** — Extend `src/types.ts` with plan-catalog, preview, structured request, permission, and version-token types. Keep API/domain types independent from React.
2. **Gateway boundary** — Refactor `src/services/subscriptionService.ts` to expose an injected `SubscriptionGateway` with read, preview, create, and withdraw operations. A production adapter calls backend endpoints; a deterministic in-memory adapter supports local development and tests.
3. **Policy and validation** — Centralize action eligibility and client validation in pure functions for consistent rendering. The backend repeats authorization, catalog validation, pending-request, and optimistic-concurrency checks.
4. **State orchestration** — Add a focused hook/reducer for load → edit → preview → confirm → result states. Generate one idempotency key per confirmation attempt and retain it across ambiguous retries.
5. **Presentation** — Split the current card into overview, management form, preview confirmation, pending-request panel, and accessible feedback components. Continue using the project’s CSS rather than introducing a component dependency.
6. **Observability** — Emit structured audit events at the service boundary and sanitized client telemetry for failures; never log payment details or raw personal data.

## API contract

- `GET /billing-accounts/{accountId}/subscription` returns subscription, actor permissions, structured pending request, and version token.
- `GET /billing-accounts/{accountId}/plans` returns eligible catalog entries and constraints.
- `POST /billing-accounts/{accountId}/subscription-change-previews` accepts requested changes plus subscription version; returns preview ID, effective date, adjustment display data, expiry, and normalized requested values.
- `POST /billing-accounts/{accountId}/subscription-change-requests` accepts preview ID and `Idempotency-Key`; returns the single created request. Reject expired/stale previews with `409`.
- `DELETE /billing-accounts/{accountId}/subscription-change-requests/{requestId}` withdraws an eligible request idempotently.

Expected errors are mapped consistently: `400` invalid input, `403` forbidden, `404` missing account/request, `409` stale state or existing pending request, `422` catalog/seat constraint, and `5xx` retryable service failure. Error bodies include a stable code, safe message, correlation ID, and optional field errors.

## Repository changes planned

```text
src/
├── App.tsx                              # route/account-level composition
├── types.ts                            # structured domain/API types
├── services/subscriptionService.ts     # gateway and policy boundary
├── hooks/useSubscriptionManagement.ts  # interaction state machine
├── components/
│   ├── SubscriptionCard.tsx
│   ├── SubscriptionChangeForm.tsx
│   ├── ChangePreviewDialog.tsx
│   └── PendingChangePanel.tsx
└── tests/                              # unit and component acceptance tests
```

No source files are changed by this planning work.

## Implementation sequence

1. Establish structured domain types and fixtures, including migration behavior for legacy `pendingChange` text.
2. Implement policy/validation functions and the gateway contract with authorization, versioning, preview, idempotency, and withdrawal semantics.
3. Add the management state machine, then build overview/form/confirmation/pending UI around it.
4. Add unit, component, integration-contract, accessibility, and responsive tests mapped to the acceptance scenarios.
5. Run repository quality gates and conduct keyboard/screen-reader smoke tests before rollout.

## Testing strategy

- **Unit**: role/action matrix, effective-date presentation, seat/no-op validation, reducer transitions, and error mapping.
- **Component**: all acceptance scenarios with injected gateway responses; confirm cancellation acknowledgment, focus management, keyboard operation, and live-region announcements.
- **Contract/integration**: preview normalization, server authorization, optimistic conflicts, idempotent retries, one-pending-request invariant, and withdrawal races.
- **End-to-end**: owner plan change, admin seat change, owner cancellation, viewer denial, pending conflict, stale preview, ambiguous network retry, and service recovery.
- **Regression gates**: `npm run agent:check` plus the new feature test command.

## Security and privacy

- Derive identity and account role from authenticated server context, never request payloads.
- Verify account membership on every endpoint and use opaque request/preview identifiers.
- Escape service messages and display only allowlisted error text.
- Audit mutation attempts and outcomes without prices tied to personal data, tokens, or payment information.
- Apply rate limits to preview and mutation endpoints and CSRF protection when cookie authentication is used.

## Rollout and monitoring

Release behind an account-level feature flag, first to internal/test accounts and then a small percentage of eligible accounts. Monitor preview-to-confirm success, authorization denials, conflict rate, duplicate-prevention events, service errors, withdrawals, and support contacts. Disable the management flag—leaving the read-only overview intact—if mutation error rate or billing reconciliation alerts exceed operational thresholds.

## Risks and mitigations

- **Incorrect financial display**: render only authoritative preview data and expiry; never calculate locally.
- **Conflicting changes**: enforce version tokens and one pending request in the transactional backend boundary.
- **Duplicate requests after timeout**: persist idempotency keys and refresh authoritative state after ambiguous failures.
- **Role drift**: reauthorize on confirm/withdraw, not only on initial load.
- **Legacy free-text pending changes**: show safely, block new changes, and require backend reconciliation.

