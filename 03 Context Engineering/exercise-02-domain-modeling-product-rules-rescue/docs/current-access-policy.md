# Current AI-History Export Policy

Status: Approved
Effective: 2026-07-15
Owner: Workspace Security

This document is the current authority for AI-history export access.

## Domain boundaries

- A billing customer pays for one or more workspaces. Its owner manages billing only.
- A workspace is the product and data-security boundary.
- A workspace membership links one user to one workspace.
- A membership role applies only inside the workspace named by that membership.

## Export rule

AI history may be exported only when every condition below is true:

- The workspace plan is `Enterprise`.
- The workspace data-residency mode is `standard`.
- The membership belongs to the requesting user.
- The membership belongs to the workspace being exported.
- The membership status is `active`.
- The membership role is `admin`.

Billing-customer ownership does not grant workspace access. A suspended membership never grants access, including when that user owns the billing customer.
