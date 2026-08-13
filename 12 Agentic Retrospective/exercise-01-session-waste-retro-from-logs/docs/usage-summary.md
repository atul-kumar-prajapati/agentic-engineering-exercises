# Usage Summary

This is a seeded lab input for Trace-Measured Session Waste Reduction. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Agent session waste analyzer from real-looking transcript logs

## Concrete Inputs

- session log
- retry loop
- repeated file read
- waste metric

## Seeded Risks

- analyzer double-counts resumed turns
- large context paste is not classified
- top waste source has no system fix

## Verification Expectations

- log parser test
- waste metric report
- rule/hook/skill fix
- before/after simulation

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
