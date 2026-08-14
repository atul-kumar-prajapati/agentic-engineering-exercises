# Exercise 01 : Implementation-Backed Workflow Reconstruction

## Your Mission

Your team is making access-control decisions from an outdated workflow document. Your mission is to reconstruct the actual provisioning workflow from code and create diagrams whose important edges can be proved from exact source lines.

The legacy description hides the high-risk security route, claims failed provisioning retries automatically, and omits rollback ownership. The UI also marks security review complete on a path that never entered it.

Compare a document-led diagram attempt with a source-led reconstruction, then submit only the verified result.

The duration for this challenge is 45 min or less.

## Project

[workflow-reconstruction-app](./workflow-reconstruction-app) contains the workflow engine and protected scenario checks. The [legacy description](./docs/legacy-workflow-description.md) is a claim to investigate, not an authority.

The required output is one complete state diagram, one normal and high-risk approval sequence, and one failure and rollback sequence.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain diagrams produced in the first branch.

2. In the first branch, start a fresh agent session with the legacy description and diagram request. Do not provide hints, corrections, or retries. Save its diagrams, `evidence/before.md`, and `evidence/before.patch`.

3. Review the first result and the [diagram contract](./docs/diagram-contract.md). Run the supplied scenario trace and inspect `nextStepFor`, `completedStagesByStatus`, actor construction, fixtures, and UI actions.

4. In the second branch, start another fresh session using the same agent, model, tools, permissions, time limit, and first-attempt condition. Require every important transition to come from source or protected trace output.

5. Create Mermaid state, approval-sequence, and failure-sequence diagrams. Distinguish normal and high-risk routing, provisioning failure, rollback request, and rollback completion.

6. Map every required edge to an exact source line in `evidence/traceability.json`. Record legacy contradictions and the UI progress conflict without silently resolving them.

7. Save `evidence/after.md`, `evidence/after.patch`, the diagram manifest, verification output, and comparison. Raise the final PR only from the second branch.

## Evidence

Submit:

- The three required Mermaid files.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/traceability.json`, `evidence/contradictions.md`, `evidence/diagram-manifest.json`, and `evidence/verification.md`.
- Captured trace and Mermaid parser output under `evidence/commands/`.
- `evidence/comparison.md` with unsupported edges, missing paths, and final coverage.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, source traces, Mermaid syntax, exact states and routes, line-level traceability, evidence hashes, and the before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both diagram sessions use matching conditions and genuine first-attempt artifacts.
- All Mermaid files parse and show only implemented states, routes, conditions, and actors.
- Every required edge maps to a valid exact source line and evidence hashes match the submitted files.
- Legacy retry, security-route, rollback-ownership, and UI-progress contradictions are recorded instead of copied as fact.
- `npm run verify:exercise` passes and the final PR contains all required diagrams and proof.
