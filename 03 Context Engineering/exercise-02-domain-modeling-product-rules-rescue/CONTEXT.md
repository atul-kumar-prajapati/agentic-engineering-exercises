# AI-History Export Context

This vocabulary separates billing relationships from workspace access so product rules describe the correct boundary.

## Language

**Billing customer**:
The person or organization that pays for one or more workspaces. A billing customer is not a workspace and billing ownership is not workspace access.
_Avoid_: Account, customer account, account owner

**Workspace**:
The isolated product environment whose plan, data-residency mode, memberships, and AI history define one authorization boundary.
_Avoid_: Account, customer, tenant

**Membership**:
A user's relationship to exactly one workspace, carrying both a status and a role. Membership in one workspace conveys no access to another workspace owned by the same billing customer.
_Avoid_: Account access, customer membership

**Role**:
The authorization classification attached to a workspace membership. A role has meaning only together with that membership's workspace and status.
_Avoid_: Account role, billing role

**Admin**:
The workspace role whose active membership may authorize administrative actions such as AI-history export. Admin is not synonymous with billing owner or owner.
_Avoid_: Owner, account owner, customer admin

**Active membership**:
A membership currently permitted to exercise its role within its workspace.
_Avoid_: Enabled account

**Suspended membership**:
A membership that cannot exercise any workspace role, including admin.
_Avoid_: Suspended account

**Billing owner**:
The person responsible for a billing customer. This relationship grants no workspace membership, role, or access by itself.
_Avoid_: Account owner when authorizing workspace actions

**Standard data residency**:
The workspace data-residency mode in which AI-history export may be considered, subject to the other authorization boundaries.

**Restricted data residency**:
The workspace data-residency mode that prohibits AI-history export regardless of plan, membership, role, or billing ownership.

**Eligible workspace**:
An Enterprise workspace using standard data residency. Eligibility does not by itself authorize a user.
_Avoid_: Eligible account
