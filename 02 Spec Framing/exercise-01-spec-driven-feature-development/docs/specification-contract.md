# Specification Contract

The verifier checks structure and traceability. It does not prescribe the product decisions you must make.

## Clarifications

- Use three to five question identifiers: `Q1` through `Q5`.
- End each heading with a clear question.
- Include `Category`, `Repository evidence`, `Status`, `Decision`, and `Consequence` for every question.
- A category may contain more than one of: Authorization, Billing, Failure, and Scope.
- Use `Status: Confirmed` when repository evidence answers the question. Use `Status: Assumption` when no approved answer is available.
- Cite `docs/stakeholder-notes.md`, `docs/billing-constraints.md`, and relevant `src/` evidence across the clarification record.

## Specification

- Define each requirement in its own heading using an identifier such as `### REQ-001: Enforce permissions`.
- Define each acceptance criterion in its own heading using an identifier such as `### AC-001: Viewer access`.
- Write acceptance criteria as observable Given, When, Then behavior.
- Cover authorization, billing behavior, pending changes, failure and recovery, and out-of-scope behavior.

## Plan and Tasks

- Define each plan item in its own heading using an identifier such as `## PLAN-001: Authorization` and reference every requirement.
- Define each task in its own heading using an identifier such as `## TASK-001: Add permission checks`.
- Every task must reference at least one requirement and one acceptance criterion.
- Every requirement and acceptance criterion must be covered by the task list.

Do not leave placeholders in the final artifacts or modify the application to implement the feature.
