# Exercise 01: Agent Onboarding Kit

## Objective

Create concise onboarding guidance that lets a fresh coding agent work safely in `agent-onboarding-app`, then prove the guidance with the supplied follow-up task.

## Starting Point

The app has duplicated routing policy, representative case data, hidden support conventions, and working checks. Read `agent-onboarding-app/docs/support-notes.md` and inspect the code before writing guidance.

## Required Implementation Changes

- Create `agent-onboarding-app/AGENTS.md` with the minimum safe-start instructions.
- Put deeper architecture, testing, ownership, and coding guidance under `agent-onboarding-app/.agent/`; link to it only when the task touches that area.
- Run the fresh-agent task in `docs/follow-up-task.md` after the guidance is complete.
- Record the independent result at `evidence/fresh-agent-result.md` using the supplied template.

## Allowed Changes

During onboarding authoring, change only `AGENTS.md`, `.agent/**`, and `evidence/**`. During the fresh-agent stage, also allow the exact routing-policy and sample-data paths named by the discovered ownership guidance.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `agent-onboarding-app`:

```text
npm ci
npm run agent:check
npm run test:follow-up
```

The final command is expected to fail before the fresh-agent change and pass afterward.

## Acceptance Criteria

- A new agent can locate both policy copies without prior conversation.
- Guidance distinguishes safe-start rules from task-specific deeper documents.
- Both policy values agree, representative data remains valid, and unrelated files are untouched.
- The clean check and follow-up verifier pass.

## Evidence Contract

Commit `evidence/fresh-agent-result.md` with starting and final SHAs, guidance read, changed paths, commands, results, and unresolved risks. Include focused command output as text if it does not fit the note.

## Incomplete When

The submission has only documentation, the same agent/session performs both stages, one policy copy is missed, checks are unrecorded, or unrelated files change.

## Evaluation Rubric

See [Agent Onboarding Kit](../../docs/EVALUATION_RUBRICS.md#agent-onboarding-kit).
