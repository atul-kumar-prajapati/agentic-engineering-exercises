# Integration

Parent: Cursor Grok 4.6. Specialists: `cursor-grok-4.6-high`, parallel, read-only. Citation tree: `/tmp/ex-11-03` working tree / named SHAs. No bundle.

## Prioritisation

1. History file-set and ancestry — must stay exact or `refactor:verify` fails.
2. Observable five-case contract and HTTP JSON — must stay exact.
3. Policy purity — already satisfied; unused `item` and dual constructors are load-bearing, not defects.

## Disposition

**Accepted as holding (no code change):** all five cases, HTTP 202/400/404, client parser, repository-free policy, lookup-then-validate-then-one-save, characterization-then-refactor history.

**Rejected / dismissed:**
- Unused `DecisionPolicy.validate` `item` parameter (`DecisionPolicy.java:7`) — contract wording, not a bug.
- 1-arg `new DecisionPolicy()` (`WorkflowService.java:12-14`) — required by existing 1-arg tests; cannot edit `WorkflowServiceTest.java` after `refactorSha`.
- Protected architecture test not asserting void return (`WorkflowContractCharacterizationTest.java:65-72`) — protected; production already meets the bar.
- Snapshot omitting Blocked — harness limit; proved at `WorkflowPolicyCharacterizationTest.java:82-99`.
- Escalated Later fixture note length 26 not isolating the Ready-only skip — residual; gap is `DecisionPolicy.java:8-9`.
- Untracked evidence before the evidence commit looking like a history leak — `rules-refactor-verification.mjs:31` is commit-to-commit.

**Deferred:** none. After.patch blobs match the unaided after agent (`DecisionPolicy` `88bcb9eb`, `WorkflowService` `4b990108`).

A review round with zero accepted production defects is still a review: the dismissals above were written down and re-derived.
