# Exercise 03: Pact Workflow Contract Gate

## Objective

Complete a consumer-driven contract gate between the React workflow client and the Spring rules API.

## Starting Point

The consumer test generates list and decision interactions with named provider states. The provider omits the seeded `decisionState` field, so the complete gate exposes a real contract mismatch. Node dependencies, Java 21, a Maven wrapper, and one orchestration script are supplied.

## Required Implementation Changes

- Decide whether `decisionState` belongs in the consumer contract and document the decision.
- Make the consumer contract and provider implementation agree without weakening meaningful matchers.
- Keep interactions for workflow listing and decision submission.
- Keep provider states `workflows exist` and `workflow wf-101 exists`.
- Make the one-command consumer and provider gate pass.

## Allowed Changes

Change Pact tests, the real workflow client, provider DTO/controller/service code, provider verification, and evidence. Do not replace the Pact with a hand-written JSON fixture or remove an interaction to obtain a pass.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From this exercise directory:

```text
cd workflow-gate-app
npm ci
cd ..
node scripts/contract-gate.mjs
```

The gate runs the consumer test and `workflow-rules-api/mvnw test -Dtest=WorkflowPactVerificationTest`.

## Acceptance Criteria

- A clean run generates the Pact from actual client calls.
- Both named interactions and provider states are present.
- The generated Pact verifies against the Spring provider.
- Contract matching allows safe variation but rejects incompatible fields or states.
- The Maven wrapper and npm lockfile are used.

## Evidence Contract

Commit the generated Pact, `evidence/contract-gate.txt`, and `evidence/contract-decision.md`. The decision note must explain the original mismatch, chosen ownership, and why the final matcher is correct.

## Incomplete When

Only the consumer test passes, the provider is not verified, a static Pact is authored manually, provider states are missing, or the mismatch is hidden by removing required behavior.

## Evaluation Rubric

See [Pact Workflow Contract Gate](../../docs/EVALUATION_RUBRICS.md#pact-workflow-contract-gate).
