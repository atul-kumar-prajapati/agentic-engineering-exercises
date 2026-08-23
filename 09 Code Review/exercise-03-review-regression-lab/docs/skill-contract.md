# Code Review Skill Contract

Create an agent-neutral skill at `regression-review-app/skills/regression-review/SKILL.md`.

The YAML frontmatter must contain `name` and `description`. The description must explain when the skill should be used. Keep the main file concise and link to supporting references only when they are needed.

The workflow must help a reviewer:

- Read the request, acceptance rules, and exact diff before forming conclusions.
- Trace changed data and decisions across callers and trusted boundaries.
- Reproduce a suspected failure before calling it a blocker.
- Check security, accessibility, state, error, and regression risks that are relevant to the change.
- Dismiss unsupported claims with evidence.
- Report severity, file, code anchor, failing scenario, impact, and verification advice.

Do not mention protected case IDs, expected finding IDs, fixture filenames, exact APIs from the cases, or copied diff fragments. The skill must remain useful for an unseen review.
