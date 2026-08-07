# Tasks: Self-Service Subscription Management

Tasks are ordered by dependency and grouped by user story. This exercise stops after producing this executable task contract; none of these implementation tasks are performed here.

## Phase 1 — Foundations

- [ ] T001 Add feature-test tooling and commands to `package.json`, preserving `npm run agent:check`.
- [ ] T002 Add plan catalog, permission, preview, version-token, and structured `PlanChangeRequest` types in `src/types.ts` (FR-001, FR-008).
- [ ] T003 Update fixtures in `src/data/subscriptions.ts` and test fixtures to cover every role, request type/status, cadence, and legacy free-text pending state (FR-001, FR-006).
- [ ] T004 Define `SubscriptionGateway` read/catalog/preview/create/withdraw contracts and stable error mapping in `src/services/subscriptionService.ts` (FR-004, FR-006).
- [ ] T005 [P] Add pure permission and action-eligibility tests for the complete owner/admin/viewer matrix (FR-002, FR-003).
- [ ] T006 [P] Add validation tests for no-op, plan availability, seat bounds, assigned-seat floor, and date-only rendering (FR-006).
- [ ] T007 Implement pure policy and validation helpers until T005–T006 pass, while retaining current summary/risk behavior (FR-002, FR-003, FR-006).

## Phase 2 — US1 Review available actions (P1)

- [ ] T008 [US1] Add failing component tests for complete subscription details, role-appropriate controls, viewer explanation, pending summary, and legacy pending blocking.
- [ ] T009 [P] [US1] Build `src/components/SubscriptionCard.tsx` for the current subscription and billing-date-safe rendering (FR-001, FR-012).
- [ ] T010 [P] [US1] Build `src/components/PendingChangePanel.tsx` with request status, effective date, and withdrawability (FR-001, FR-008).
- [ ] T011 [US1] Compose selected-account loading, empty, success, and authorization states in `src/App.tsx`; make T008 pass (FR-010).

## Phase 3 — US2 Request a plan, seat, or cadence change (P1)

- [ ] T012 [US2] Add failing gateway contract tests for authoritative preview, server authorization, stale versions, existing pending requests, idempotent create, and safe error bodies (FR-002, FR-004, FR-006, FR-007).
- [ ] T013 [US2] Implement preview/create methods in the in-memory and backend gateway adapters; emit sanitized audit events (FR-004, FR-007, FR-013).
- [ ] T014 [US2] Add failing reducer/hook tests for edit, preview loading, confirmation, success, validation, conflict, service error, ambiguous timeout, refresh, and retry states (FR-005, FR-010).
- [ ] T015 [US2] Implement `src/hooks/useSubscriptionManagement.ts`, retaining an idempotency key across ambiguous retries and refreshing authoritative state after conflicts (FR-006, FR-007, FR-010).
- [ ] T016 [P] [US2] Build `src/components/SubscriptionChangeForm.tsx` with catalog-driven plan/cadence choices and accessible field validation (FR-003, FR-004, FR-012).
- [ ] T017 [P] [US2] Build `src/components/ChangePreviewDialog.tsx` showing old/new values, effective date, authoritative adjustment, preview expiry, and safe focus handling (FR-005, FR-012).
- [ ] T018 [US2] Integrate form, hook, preview, confirmation, refresh, and result feedback; make US2 component and contract tests pass (FR-004–FR-010).

## Phase 4 — US3 Schedule cancellation (P2)

- [ ] T019 [US3] Add failing tests for owner-only cancellation across UI and gateway, renewal-date timing, explicit impact acknowledgment, and unchanged active state.
- [ ] T020 [US3] Add cancellation preview/create policy to gateway adapters and audit events; reject admin/viewer requests server-side (FR-002, FR-003, FR-013).
- [ ] T021 [US3] Extend the confirmation dialog with non-default destructive action and explicit acknowledgment; make T019 pass (FR-005, FR-011, FR-012).

## Phase 5 — US4 Withdraw a pending request (P2)

- [ ] T022 [US4] Add failing contract/component tests for eligible withdrawal, already-applied/withdrawn races, unauthorized users, idempotent retry, and refreshed state.
- [ ] T023 [US4] Implement withdraw in gateway adapters with server reauthorization, status checks, idempotency, and audit events (FR-002, FR-009, FR-013).
- [ ] T024 [US4] Connect withdrawal confirmation and feedback in `PendingChangePanel`; make T022 pass (FR-009–FR-012).

## Phase 6 — Verification and rollout readiness

- [ ] T025 [P] Add automated accessibility coverage for overview, form, dialog, pending, success, and error states; resolve all critical violations (SC-005).
- [ ] T026 [P] Add responsive-layout tests and manual viewport checks for management and confirmation states (FR-012).
- [ ] T027 Add end-to-end scenarios for owner change, admin change, cancellation, viewer denial, pending conflict, stale preview, and timeout retry (SC-001–SC-004).
- [ ] T028 Add feature-flag handling and sanitized telemetry for preview/confirm outcomes, conflicts, denials, duplicate prevention, errors, and withdrawals.
- [ ] T029 Document backend endpoint/error/idempotency contracts and the phased rollout/rollback runbook.
- [ ] T030 Run the feature suite and `npm run agent:check`; record keyboard/screen-reader smoke-test evidence and confirm no unresolved P1/P2 acceptance failures.

## Dependencies and parallel work

- T001–T007 form the shared foundation and must complete before story work.
- US1 can ship as the reusable display foundation; US2 depends on it. US3 depends on the US2 preview/confirmation path. US4 depends on the pending panel from US1 and gateway infrastructure from US2.
- Tasks marked `[P]` may run in parallel after their phase prerequisites. Tests intentionally precede implementation in each story.

## Definition of done

- Every functional requirement and P1/P2 acceptance scenario has an automated or explicitly manual verification.
- Client and server authorization tests pass for the full role/action matrix.
- Preview values always originate from the billing boundary; idempotency and stale-state tests pass.
- Accessibility checks and keyboard smoke tests pass.
- `npm run agent:check` and the new feature test suite pass, and rollout/rollback documentation is approved.
