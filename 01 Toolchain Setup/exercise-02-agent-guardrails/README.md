# Exercise 02: Agent Guardrails

## Objective

Create executable boundaries for `yolo-agent-app` so normal development is allowed while secrets, production changes, destructive commands, and bypass attempts are blocked or approval-gated.

## Starting Point

The repository contains tracked secret-like fixtures, production configuration, migrations, generated code, and legacy release commands. The policy engine, secure and weakened fixtures, and executable test matrix are supplied.

## Required Implementation Changes

- Create `yolo-agent-app/.agent/guardrails.json` using the policy schema demonstrated by the fixtures.
- Document how the agent invokes the policy before an action and where audit records are written.
- Keep safe source reads, owned source edits, and standard tests allowed.
- Make secret reads, production edits, releases, path traversal, symlink escapes, and prompt injection fail.
- Make migrations and generated-code changes require approval.

## Allowed Changes

Change `.agent/**`, policy integration under `scripts/**`, policy tests, and evidence. Do not edit `secrets/**`, `config/production.json`, migrations, or legacy release commands to make tests pass.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `yolo-agent-app`:

```text
npm ci
npm run test:policy-engine
npm run test:guardrails
npm run agent:check
```

## Acceptance Criteria

- Every allowed, blocked, and approval-required matrix case returns the expected decision.
- The deliberately weakened policy fails validation.
- Blocked probes create an audit record without reading the target.
- Changing or removing a required guard makes the suite fail.

## Evidence Contract

Commit `evidence/guardrail-results.md` with the policy path, command output, matrix summary, audit-log excerpt without secrets, and any boundary that is documented but not platform-enforced.

## Incomplete When

Rules exist only in prose, tests do not exercise bypasses, secrets are read into evidence, blocked and approval-required are indistinguishable, or the weakened policy passes.

## Evaluation Rubric

See [Agent Guardrails](../../docs/EVALUATION_RUBRICS.md#agent-guardrails).
