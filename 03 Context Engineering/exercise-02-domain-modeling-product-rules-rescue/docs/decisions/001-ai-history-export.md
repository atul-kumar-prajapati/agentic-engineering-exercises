# Decision: authorize AI-history export at the workspace membership boundary

Status: accepted

The approved **Current AI-History Export Policy** (`../current-access-policy.md`, effective 2026-07-15, owned by Workspace Security) is authoritative. The **Legacy Rollout Notes** (`../legacy-rollout-notes.md`) are explicitly a superseded 2025 draft; their "account owner" language conflates billing customers with workspaces and must not determine access. The cross-workspace and suspended-member cases in **Support Example** (`../support-example.md`) confirm the approved policy's boundaries.

## Decision

AI-history export is allowed only when all of these conditions hold:

1. The target workspace is on the Enterprise plan.
2. The target workspace uses standard data residency; restricted data residency is blocked.
3. The caller has an active membership in the same workspace; a suspended membership is blocked.
4. That same-workspace membership has the admin role.

Billing-customer ownership never substitutes for same-workspace membership. A Growth workspace is not eligible, even though the legacy draft proposed it.

## Considered sources

- **Accepted:** `../current-access-policy.md`, because it is approved, current, effective-dated, and has an accountable owner.
- **Corroborating example:** `../support-example.md`, because it tests billing ownership, cross-workspace access, and suspension without contradicting the approved policy.
- **Rejected as authority:** `../legacy-rollout-notes.md`, because it labels itself a superseded draft and warns against treating its overloaded vocabulary as current policy.

## Consequences

Policy code and tests must express workspace, membership, role, plan, and data-residency concepts directly. The terms account, customer, owner, and admin must not be treated as interchangeable.
