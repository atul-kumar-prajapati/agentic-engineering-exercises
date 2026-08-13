# Exercise 03 : Contract-Safe Full-Stack Rules Extraction

## Your Mission

Your mission is to extract a Spring workflow decision policy without breaking its React client, validation errors, persistence behavior, or audit wording.

You are given a service where lookup, validation, mutation, and persistence are interleaved. A clean-looking extraction can change exception order, response fields, or repository state after rejection.

Create a dedicated policy boundary, preserve the public contract, and verify the API and client together.

The duration for this challenge is 30 min or less.

## Project

[legacy-rules-api](./legacy-rules-api) contains the Spring service and [legacy-rules-app](./legacy-rules-app) contains its client. [rules contract](./docs/rules-contract.md) defines protected behavior.

## How To Go About It

Add characterization tests before moving code. Extract validation and decision rules into `DecisionPolicy` while keeping repository lookup and persistence in the service.

Preserve error type and message, response shape, rejected-state immutability, and client parsing. Use a recipe or mechanical refactor only where the transformation is repeatable and reviewed.

## Evidence

Submit the extraction and tests, `evidence/contract-before.json`, `evidence/contract-after.json`, `evidence/refactor-map.md`, and `evidence/rollback.md`.

Run the Maven wrapper test suite, then run `npm run test:submission` and `npm run agent:check` from `legacy-rules-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check characterization-first work, a real policy boundary, stable exception and JSON contracts, no persistence after rejection, client compatibility, and full-stack verification.

The exercise is incomplete if only one project is tested, the contract changes silently, policy remains interleaved in the service, or expected responses are rewritten.

See the [Contract-Safe Full-Stack Rules Extraction rubric](../../docs/EVALUATION_RUBRICS.md#contract-safe-full-stack-rules-extraction).
