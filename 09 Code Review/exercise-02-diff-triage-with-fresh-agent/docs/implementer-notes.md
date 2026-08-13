# Implementer Notes

This is a seeded lab input for Independent Diff Triage. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Fresh-agent review of cache and workflow-state changes

## Concrete Inputs

- fresh review prompt
- local storage cache
- mutable fixture
- triage table

## Seeded Risks

- cached state is never updated after save
- sort mutates shared fixtures
- cache clear erases legitimate user work

## Verification Expectations

- fresh-agent finding verification
- cache regression test
- human triage
- merge confidence note

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
