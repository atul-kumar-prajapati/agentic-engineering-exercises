# Checkout Legacy Map

This is a seeded lab input for Strangler Checkout Route. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Strangler replacement for one checkout decision branch

## Concrete Inputs

- legacy checkout path
- adapter
- feature flag
- golden output

## Seeded Risks

- new path changes tax rounding
- adapter does not preserve error shape
- flag rollback still calls new module

## Verification Expectations

- old/new comparison
- adapter contract test
- flag rollback test
- golden screenshot/output

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
