# Pr Brief

This is a seeded lab input for Failure-Preserving PR Evidence Pack. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Automated PR evidence pack for generated code

## Concrete Inputs

- PR template
- check output
- screenshot artifact
- risk note

## Seeded Risks

- evidence pack omits failed smoke output
- PR template asks reviewers to infer rollback risk
- artifact path is not stable for CI

## Verification Expectations

- evidence generator
- artifact path check
- PR template fill
- failure-output capture

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
