# Legacy Case Table

This is a seeded lab input for Contract-Safe Full-Stack Rules Extraction. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Spring Boot rules endpoint refactor with preserved contract

## Concrete Inputs

- rules endpoint
- validation
- side effect
- golden API response

## Seeded Risks

- validation and side effects are interleaved
- refactor changes error code contract
- audit log text changes without approval

## Verification Expectations

- Spring characterization tests
- API golden comparison
- React adapter smoke
- contract preservation check

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
