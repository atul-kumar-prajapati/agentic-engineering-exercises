# Workflow Release Requirements

## Client boundary

- Treat every provider response as unknown input at runtime.
- Reject a response when `decisionState` is missing or is not `needs-evidence`, `pending-review`, or `accepted`.
- Preserve the existing workflow fields after validation.

## Provider boundary

- Include a derived `decisionState` in every workflow response.
- Map `Blocked` to `needs-evidence`, `In Review` to `pending-review`, and `Ready` to `accepted`.
- Accept decision transitions only to `Blocked` or `Ready`.
- Reject any other transition before saving it.
- Keep the existing evidence-note rule for `Ready` decisions.

## Release gate

Run these surfaces exactly once from one command:

1. The protected gate contract check.
2. The protected client release tests.
3. Client integrity, quality checks, typecheck, and production build.
4. The complete Maven test and package lifecycle through the committed wrapper.

The gate must stop on the first non-zero result or process-spawn error and exit non-zero. It may report success only after every surface passes.

## Completion claim

Record the exact command, implementation commit SHA, date, relevant unedited output, and exit code from one fresh gate run. A focused test, cached artifact, previous run, expected result, or another agent's summary is not release evidence.
