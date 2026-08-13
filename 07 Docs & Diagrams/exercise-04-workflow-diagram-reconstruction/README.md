# Exercise 04 : Implementation-Backed Workflow Reconstruction

## Your Mission

Your mission is to reconstruct an access-provisioning workflow from code when the existing product description is no longer reliable.

You are given normal and high-risk approval paths, provisioning failure, and rollback behavior. The legacy description skips security review and claims failed provisioning retries automatically.

Create diagrams that show the real state transitions and actor interactions, then prove every important edge with a source reference.

The duration for this challenge is 30 min or less.

## Project

[workflow-reconstruction-app](./workflow-reconstruction-app) contains the implemented workflow. [legacy workflow description](./docs/legacy-workflow-description.md) is intentionally stale and must not be treated as authoritative.

## How To Go About It

Trace `nextStepFor`, the supplied scenarios, and failure behavior before drawing. Produce a Mermaid state diagram and sequence diagram for both the high-risk success path and failed-provisioning rollback path.

Create a traceability table mapping each non-obvious diagram edge to a function, condition, or fixture. Record contradictions instead of silently choosing the product description.

## Evidence

Submit `diagrams/access-state.mmd`, `diagrams/access-sequence.mmd`, `evidence/traceability.md`, and `evidence/verification.md` containing render results and contradiction decisions.

Run `npm run test:submission` and `npm run agent:check` from `workflow-reconstruction-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check high-risk security review, normal routing, provisioning failure, rollback, actors, and source-backed edges. Both Mermaid files must render successfully.

The exercise is incomplete if diagrams reproduce the stale description, omit failure behavior, use unsupported edges, or lack source traceability.

See the [Implementation-Backed Workflow Reconstruction rubric](../../docs/EVALUATION_RUBRICS.md#implementation-backed-workflow-reconstruction).
