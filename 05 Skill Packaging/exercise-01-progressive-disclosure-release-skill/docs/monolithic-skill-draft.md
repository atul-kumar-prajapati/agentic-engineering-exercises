# Monolithic Release Skill Draft

This previous draft is intentionally a poor package. It was pasted into every release session with all policy, examples, commands, and expected output mixed together.

## Trigger

Use for releases, commits, PRs, summaries, changelogs, incident fixes, migration announcements, and any request about changes.

## Workflow and policy

Read every commit, every changed file, all PR descriptions, and all CI logs. Publish fixes and refactors. Put breaking changes somewhere visible. If evidence is not present, assume the author ran the expected check. Use a shell pipeline to copy the log into the prompt, then manually group it.

## Example expected output

- Checkout retries work.
- Billing export changed.
- Telemetry was cleaned up.

This file is a protected source artifact. Build a new standards-compliant skill rather than editing this draft into the expected answer.
