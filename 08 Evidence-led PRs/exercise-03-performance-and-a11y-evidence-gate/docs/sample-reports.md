# Sample Reports

This is a seeded lab input for Performance and Accessibility Release Gate. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Performance and accessibility gate for a generated UI change

## Concrete Inputs

- Lighthouse report
- a11y violation
- budget threshold
- before/after capture

## Seeded Risks

- largest contentful section regresses past budget
- button has no accessible name
- report is generated but not attached to evidence

## Verification Expectations

- a11y check
- performance budget
- before/after report
- evidence pack link

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
