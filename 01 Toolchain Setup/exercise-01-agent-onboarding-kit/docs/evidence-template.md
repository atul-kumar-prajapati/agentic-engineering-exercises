# Evidence Template

Use these headings in the required evidence files. Replace every instruction with the actual result from the agent session.

## `evidence/before.md`

- Starting commit:
- Session identifier:
- Agent and model:
- Tools and permissions:
- Time allowed:
- Feature request used:
- Onboarding files available: None
- Files changed:
- Approach taken:
- Checks run and results:
- Human help provided:
- Did the implementation copy or extend the existing bad practice? Explain:
- Patch: `evidence/before.patch`

## `evidence/after.md`

- Starting commit:
- Session identifier:
- Agent and model:
- Tools and permissions:
- Time allowed:
- Feature request used:
- Onboarding files read:
- Files changed:
- Approach taken:
- Checks run and results:
- Human help provided:
- Did the implementation avoid the existing bad practice? Explain:
- Patch: `evidence/after.patch`

## `evidence/comparison.md`

- Confirm that both runs used the same feature request, starting application code, model, tools, permissions, and time limit.
- Explain how the two implementations differed.
- Identify any business rules copied by either implementation.
- Name the onboarding instructions that influenced the second result.
- Compare correctness, maintainability, verification, and human help required.
- State whether the onboarding improved the result and support the conclusion with evidence.
