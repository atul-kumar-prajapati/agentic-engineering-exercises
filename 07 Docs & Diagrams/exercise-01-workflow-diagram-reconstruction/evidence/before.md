# Document-Led First Attempt

## Session Conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Branch: `codex/exercise-01-workflow-diagram-reconstruction-before`
- Input: only `docs/legacy-workflow-description.md` and a request for state, approval-sequence, and failure-sequence Mermaid diagrams
- Agent conditions: fresh Codex subagent, inherited model, standard workspace tools and permissions, one first attempt, no hints, corrections, retries, source inspection, contract inspection, or verifier-guided revision
- Time limit: 45 minutes; the attempt completed within the limit

## Result

Changed files: the three files under `diagrams/`.

The Mermaid parser passed all three files with exit code `0` when the integration owner ran `npm run diagrams:parse` against the untouched attempt. The semantic verifier failed with exit code `1`.

## Unsupported Edges

Unsupported state-transition count: **7**. The attempt used legacy-only or non-contract transitions, including `Provisioning --> Provisioning` as an automatic retry and non-contract state names such as `Draft`, `ManagerApproval`, and `DataOwnerApproval`. All ten required state transitions and all edge markers were missing.

## Missing Paths

Required scenario paths missing: **3**.

1. High-risk manager approval through in-application security review.
2. Unhealthy provisioning to failed provisioning and rollback request.
3. Identity-admin removal of partial access and rollback completion.

The normal approval idea was present, but it did not use the required source-backed states, actors, conditions, or edge evidence.

## Preservation

`evidence/before.patch` is the genuine uncommitted Git diff of the three first-attempt diagram files preserved in commit `43384b4` on `codex/exercise-01-workflow-diagram-reconstruction-before`. No corrections were requested from the document-led agent.
