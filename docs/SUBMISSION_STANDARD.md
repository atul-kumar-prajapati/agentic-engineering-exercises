# Exercise Submission Standard

Every exercise README defines the task-specific implementation, allowed scope, commands, evidence, incomplete conditions, and rubric link. The local README takes precedence when it is more specific.

## Supported Toolchain

- Node.js 22.12 or newer, below Node 25. Use the committed npm lockfile and `npm ci`.
- Java 21 for Java exercises. Use the committed Maven wrapper, not a workstation Maven installation.
- Playwright exercises must run `npx playwright install chromium` after `npm ci`.

## Evidence Rules

Place submission evidence under the selected exercise's `evidence/` directory. Use Markdown for explanations and plain-text or JSON for command output. Commit only the requested trace, report, screenshot, Pact, or eval result. Do not commit `node_modules`, build output, browser caches, secrets, or reports unrelated to the acceptance criteria.

Each evidence note must record the command, date, result, relevant artifact path, and a short explanation connecting the result to a requirement. Keep individual binary artifacts below 10 MB unless the exercise README says otherwise.

## Review Decision

A submission is incomplete when a required command was not run, required evidence is absent, the supplied starter problem was replaced instead of solved, expected answers are encoded into a verifier, or unrelated exercise folders were changed.
