# Flag Brief

This is a seeded lab input for Feature Flag Kill-Switch Proof. It gives the learner concrete constraints to inspect, implement, test, and verify.

## Operating Context

Risky UI rollout guarded by feature flag and rollback proof

## Concrete Inputs

- feature flag
- rollback config
- telemetry event
- disabled state

## Seeded Risks

- flag default differs between dev and CI
- rollback path leaves telemetry enabled
- disabled state still calls the new API

## Verification Expectations

- flag on/off tests
- rollback script
- telemetry assertion
- PR evidence capture

## Agent Workflow Constraint

The learner must use an agent to inspect and plan, but the final implementation, review, and verification remain owned by the accountable engineer.
