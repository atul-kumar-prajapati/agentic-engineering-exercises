# Regression Seeds

This is a seeded lab input for Code Review Regression Gate. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Regression review for filtering, risk scoring, and hidden work

## Concrete Inputs

- fresh review
- NFR checklist
- regression test
- triage decision

## Seeded Risks

- blocked work disappears under all-status filter
- partial search no longer matches owner or note
- risk scoring lowers due-today blocked work

## Verification Expectations

- fresh model review
- NFR checklist
- failing-then-passing tests
- fix/defer/dismiss triage

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
