# Exercise 01: Spec-Driven Feature Development

## Objective

Turn the ambiguous subscription request into a traceable specification, but first identify the decisions that the request does not answer.

## Starting Point

Read `subscription-management-app/docs/feature-request.md` and inspect current subscription behavior. Use the supplied clarification template before Spec Kit artifacts are created.

## Required Implementation Changes

- Create `subscription-management-app/specs/clarifications.md` with three to five important questions.
- For every unavailable answer, state the assumption and its consequence.
- Cover authorization, billing or proration, failure and recovery, and an explicit scope boundary.
- Create `specs/spec.md`, `specs/plan.md`, and `specs/tasks.md` with traceable acceptance criteria and risks.

## Allowed Changes

Change only `subscription-management-app/specs/**` and `evidence/**`. Application implementation is outside this exercise.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `subscription-management-app`:

```text
npm ci
npm run agent:check
npm run spec:verify
```

## Acceptance Criteria

- Clarifications precede the specification and contain three to five real decisions.
- Assumptions are explicit rather than silently invented.
- Authorization, billing, failure, and scope consequences appear in the specification.
- Plan and tasks trace back to acceptance criteria and identify dependencies.

## Evidence Contract

Commit the four spec artifacts and `evidence/spec-review.md` containing the validation output, unanswered questions, final assumptions, and a brief trace from each major requirement to plan/task entries.

## Incomplete When

Clarifications are generic, required boundaries are absent, the template contains placeholders, tasks cannot be traced to the spec, or implementation begins before framing is complete.

## Evaluation Rubric

See [Spec-Driven Feature Development](../../docs/EVALUATION_RUBRICS.md#spec-driven-feature-development).
