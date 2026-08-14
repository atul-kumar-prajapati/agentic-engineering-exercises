# Workflow Rules Contract

## Order and ownership

`WorkflowService` looks up the item before policy validation. A missing ID therefore throws `WorkflowNotFoundException` even when the submitted Ready decision is invalid.

`DecisionPolicy` validates the supplied item and decision only. It has no repository, performs no persistence, and returns no replacement item. The service constructs and saves an accepted item exactly once.

## Protected behavior

- Ready with an evidence note shorter than 12 characters throws `InvalidWorkflowDecisionException` with exactly `Ready decisions require a longer evidence note`.
- Length 12 is accepted.
- Rejection leaves the repository item byte-for-byte equivalent and performs zero saves.
- Unknown non-Ready status strings remain accepted. This validation gap is intentionally preserved, not endorsed.
- Acceptance preserves `id`, `customer`, and `score`, and replaces `status`, `owner`, and `note`.

## HTTP and client contract

Success remains HTTP 202 with exactly `id`, `customer`, `status`, `score`, `owner`, and `note`. Invalid decisions remain HTTP 400 with `{ "error": "Ready decisions require a longer evidence note" }`. Missing workflows remain HTTP 404 with the existing error object.
