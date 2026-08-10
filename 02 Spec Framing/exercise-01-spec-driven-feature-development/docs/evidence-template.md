# Before and After Evidence Template

Use this structure for both `evidence/before.md` and `evidence/after.md`.

## Session Conditions

- Agent:
- Model:
- Tools:
- Permissions:
- Time limit:
- Attempt: 1
- Prompt: Allow users to manage their subscriptions.

## Result

Record whether the agent produced an implementation-ready result and why.

## Invented or Resolved Decisions

For the before run, list decisions the agent invented without evidence. For the after run, list decisions resolved by `specs/clarifications.md` and cite their question identifiers.

## Missing Questions or Remaining Blockers

For the before run, list important questions the agent missed. For the after run, state any remaining blocker or write `None` and explain why the specification is ready.

## Artifacts and Validation

List the generated artifacts and relevant command results.

Create `evidence/comparison.md` separately. Explain whether the conditions were identical, identify at least three specific improvements, and connect each improvement to a clarification question and final requirement.
