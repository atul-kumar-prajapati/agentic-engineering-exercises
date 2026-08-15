# Accountable Integration Notes

The main agent retained ownership of integration, source binding, evidence generation, verification, commits, and push scope.

## Prioritization

1. Preserve the two independent first attempts before applying review feedback.
2. Accept only diagram behavior supported by protected source or trace output.
3. Record contradictions instead of editing protected workflow inputs.
4. Freeze reviewed diagrams in a dedicated source commit before adding evidence.

## Dispositions

- Accepted: all ten source-led diagram mappings and all Mermaid semantic structures.
- Implemented: exact traceability records, four legacy contradictions, the UI projection contradiction, before/after comparison, specialist scope and handoffs, command capture, and hash manifest.
- Rejected: the legacy automatic retry, direct-to-data-owner high-risk route, outside-application security claim, and omission of rollback ownership.
- Deferred: correcting `completedStagesByStatus` because `src/workflow.tsx` is protected and the exercise requires the conflict to remain visible.

No specialist had overlapping write ownership. Diagram authors were isolated by branch and scope; reviewers were read-only. The final branch contains only the source-led diagrams and evidence, while the legacy attempt remains independently inspectable on its before branch.
