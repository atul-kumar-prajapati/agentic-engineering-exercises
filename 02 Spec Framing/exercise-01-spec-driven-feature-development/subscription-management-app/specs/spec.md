# Feature Specification: Self-Service Subscription Management

**Feature branch**: `codex/spec-subscription-management`  
**Status**: Draft for implementation  
**Input**: “Allow users to manage their subscriptions.”

## Scope and assumptions

This feature extends the existing subscription overview with self-service plan, seat, billing-cadence, and cancellation controls. It does not implement payment collection, invoices, refunds, proration calculations, plan-catalog administration, or multi-currency support. A billing platform remains authoritative for prices, effective dates, and charge adjustments.

The following product assumptions resolve gaps in the request:

- `account_owner` may request any supported change and cancel a subscription.
- `billing_admin` may change plan, seats, or cadence, but may not cancel.
- `viewer` has read-only access.
- Every mutation is represented by one pending plan-change request. An account may have at most one pending request.
- Seat increases take effect immediately after confirmation. Seat decreases, plan downgrades, cadence changes, and cancellations take effect on the current renewal date.
- Plan upgrades use the effective date and pricing preview returned by the billing platform. The UI does not calculate money.
- A pending request can be withdrawn by an `account_owner` or `billing_admin`; this does not reverse a change that has already taken effect.
- Dates are displayed in the account billing timezone; the seeded ISO date-only values are treated as billing dates, not browser-local instants.

## User scenarios and acceptance criteria

### US1 — Review available actions (Priority: P1)

As an authorized account administrator, I can open a subscription-management view and understand the current subscription, renewal, pending change, and actions available to me.

**Independent test**: Open each seeded account and verify its current state and role-appropriate controls without submitting a change.

**Acceptance scenarios**:

1. **Given** an account with no pending request, **when** its management view opens, **then** current plan, seats, cadence, renewal date, and permitted actions are shown.
2. **Given** a viewer, **when** the management view opens, **then** subscription data remains visible and all mutation controls are absent or disabled with a permission explanation.
3. **Given** an account with a pending request, **when** the management view opens, **then** the request summary and effective timing are shown, and creation of another request is blocked.

### US2 — Request a plan, seat, or cadence change (Priority: P1)

As an account owner or billing admin, I can preview and confirm a supported subscription change so I know what will change and when.

**Independent test**: Submit one valid change with a stubbed billing preview and observe the resulting pending state.

**Acceptance scenarios**:

1. **Given** an authorized user and no pending request, **when** they select a different supported plan, seat count, or cadence, **then** the system requests an authoritative preview containing the proposed values, effective date, and any billing adjustment.
2. **Given** a successful preview, **when** the user confirms it, **then** exactly one change request is created and the account displays its pending state.
3. **Given** unchanged values, an unavailable plan, or a seat count outside the selected plan’s limits, **when** preview is requested, **then** submission is blocked and a field-level explanation is shown.
4. **Given** the subscription changed after the view was loaded, **when** confirmation is attempted, **then** no request is created and the user is prompted to reload and review a fresh preview.
5. **Given** the preview or submission service fails, **when** the operation completes, **then** the prior subscription state remains visible, the failure is announced, and retry is available without duplicate creation.

### US3 — Schedule cancellation (Priority: P2)

As an account owner, I can schedule cancellation at renewal after acknowledging its impact.

**Independent test**: As an owner, schedule cancellation and verify its effective date; repeat as other roles and verify denial.

**Acceptance scenarios**:

1. **Given** an account owner and no pending request, **when** cancellation is selected, **then** the confirmation identifies the renewal-date effective date and loss-of-service impact.
2. **Given** the owner confirms cancellation, **when** the request succeeds, **then** a pending cancellation is displayed and the subscription remains active through the effective date.
3. **Given** a billing admin or viewer, **when** cancellation is attempted through UI or service, **then** it is rejected and no account state changes.

### US4 — Withdraw a pending request (Priority: P2)

As an account owner or billing admin, I can withdraw a scheduled request before it takes effect.

**Independent test**: Withdraw a pending request and verify controls become available again.

**Acceptance scenarios**:

1. **Given** an authorized user and a withdrawable pending request, **when** withdrawal is confirmed, **then** the request becomes withdrawn and current subscription values remain unchanged.
2. **Given** a request already applied, withdrawn, or no longer withdrawable, **when** withdrawal is attempted, **then** the service rejects it and the latest account state is displayed.

## Functional requirements

- **FR-001**: The system MUST show plan, seat count, cadence, renewal date, role, and structured pending-change details for the selected billing account.
- **FR-002**: The system MUST enforce authorization server-side for every mutation using the authenticated user’s account role; client-side visibility is not sufficient authorization.
- **FR-003**: Owners and billing admins MUST be able to request plan, seat, and cadence changes; only owners may request cancellation; viewers MUST remain read-only.
- **FR-004**: The system MUST obtain plan availability, seat constraints, effective date, and financial impact from an authoritative plan/billing service before confirmation.
- **FR-005**: The confirmation step MUST show old and new values, effective date, and any billing adjustment returned by the preview.
- **FR-006**: The system MUST reject no-op changes, invalid seats, unavailable plans, unauthorized changes, stale previews, and a second request while one is pending.
- **FR-007**: Confirmed mutations MUST be idempotent so retries cannot create duplicate requests.
- **FR-008**: The system MUST preserve current subscription values until a scheduled request takes effect and MUST expose request status separately.
- **FR-009**: Authorized administrators MUST be able to withdraw a pending request when the billing service marks it withdrawable.
- **FR-010**: The UI MUST present loading, success, empty, validation-error, authorization-error, conflict, and service-error states with accessible status announcements.
- **FR-011**: Destructive cancellation confirmation MUST require an explicit acknowledgement and MUST not be the default focused action.
- **FR-012**: Management controls MUST be operable by keyboard, have programmatic labels, and meet the application’s existing accessibility and responsive-layout conventions.
- **FR-013**: Each preview, creation, denial, failure, and withdrawal MUST emit an audit event with account, actor, action, request identifier, outcome, and timestamp, excluding secrets and payment data.

## Data model

### Subscription

Existing fields remain: account ID, company, plan name, seats, cadence, renewal date, and role. Add a version token for optimistic concurrency and replace the free-text pending change with structured request data.

### Plan catalog entry

Contains stable plan ID, display name, allowed cadences, seat constraints, availability, and display metadata. Pricing displayed at confirmation comes from the preview response.

### Plan change request

Contains request ID, account ID, type (`plan`, `seats`, `cadence`, or `cancellation`), previous and requested values, status (`pending`, `applied`, `withdrawn`, `failed`), requested-by actor, requested-at timestamp, effective date, withdrawable flag, billing-preview reference, and subscription version.

## Edge cases

- Renewal date occurs today or crosses a daylight-saving boundary in the billing timezone.
- A plan is retired or its constraints change between selection and confirmation.
- Seat count is below current assigned seats; the request must be rejected with remediation guidance rather than silently removing access.
- The user’s role changes while the form is open.
- The subscription renews, is canceled externally, or receives another change before confirmation.
- A network timeout occurs after successful creation; idempotency and refresh reveal the single authoritative result.
- The pending request is unknown legacy free text; it is displayed safely and blocks mutations until reconciled.

## Success criteria

- **SC-001**: In acceptance tests, 100% of unauthorized mutation attempts are rejected without persisted changes.
- **SC-002**: In acceptance tests, every successful request displays the same effective date and adjustment returned by the billing preview.
- **SC-003**: Retried confirmations with the same idempotency key create exactly one request.
- **SC-004**: All P1 and P2 acceptance scenarios pass, including stale-state, service-failure, and pending-request conflicts.
- **SC-005**: Automated accessibility checks report no critical violations in overview, management, confirmation, success, and error states; keyboard-only completion is verified manually.

## Out of scope

- Implementing the feature as part of this specification exercise.
- Collecting or changing payment methods, tax details, invoices, credits, or refunds.
- Computing prices or proration in the client.
- Immediate cancellation, reactivation after cancellation takes effect, or multiple concurrent change requests.
- Creating or administering plans and entitlements.

