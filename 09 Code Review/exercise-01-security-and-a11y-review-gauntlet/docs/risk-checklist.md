# Risk Checklist

This is a seeded lab input for Security and Accessibility Review Gauntlet. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Security and accessibility review of a generated approval UI

## Concrete Inputs

- review diff
- unsafe rendering
- keyboard navigation
- severity finding

## Seeded Risks

- dangerous HTML preview is introduced
- queue rows lose button semantics
- high-priority approval bypasses evidence

## Verification Expectations

- fresh review
- security test
- a11y regression test
- fix/defer/dismiss triage

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
