# Workflow API Contract

Status: Current
Version: 2.4

The following exports are used by the dashboard and verification tooling:

- `fetchWorkItems()` returns a copy of the saved queue state.
- `saveAction(itemId, draft)` saves a manual workflow action and returns the saved item.
- `runAutomaticEscalation()` applies the current policy, saves the resulting queue, and returns a copy of that state.
- `collectEvidence(item)` returns display evidence without changing the item.

Do not rename or remove these exports. Callers must not receive mutable references to internal queue state.

When a user manually selects `Escalated`, `saveAction` records `escalationMode` as `manual`. Moving a case out of `Escalated` clears its escalation mode. An existing automatic escalation remains automatic when its note or owner is updated without changing its escalated status.
