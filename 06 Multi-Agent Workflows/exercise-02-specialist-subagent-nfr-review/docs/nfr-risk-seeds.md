# Nfr Risk Seeds

This is a seeded lab input for Specialist Review Merge Gate. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Specialist NFR swarm for a risky generated change

## Concrete Inputs

- security review
- accessibility review
- performance review
- main-thread decision log

## Seeded Risks

- specialist findings are merged without triage
- accessibility pass lacks keyboard coverage
- performance finding has no measurement

## Verification Expectations

- specialist report schema
- fix/defer/dismiss table
- implemented top fixes
- post-fix recheck

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
