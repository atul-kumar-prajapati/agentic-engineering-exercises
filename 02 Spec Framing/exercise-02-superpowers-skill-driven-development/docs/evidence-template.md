# Superpowers Workflow Evidence Template

## Before and After Sessions

Use these fields in both `evidence/before.md` and `evidence/after.md`:

- Agent:
- Model:
- Tools:
- Permissions:
- Time limit:
- Attempt: 1
- Prompt: Copy the feature request exactly.

Describe the investigation, design, planning, testing, implementation, review, and verification performed by the agent. Link the corresponding patch.

## Skill Usage

In `evidence/skill-usage.md`, record:

- Superpowers version or commit:
- Design artifact: repository-relative Markdown path
- Plan artifact: repository-relative Markdown path
- Design approval: what was approved before planning began

List each invoked `superpowers:` skill, its purpose, and the artifact or result it produced.

## TDD

In `evidence/tdd.md`, include the command and unedited output from the failing invitation test before production implementation, followed by the command and passing output after implementation.

## Review

In `evidence/review.md`, list each finding with its severity, affected file, resolution, and verification. Write `No findings` only when the recorded review actually returned none.

## Comparison

In `evidence/comparison.md`, explain why the conditions were fair and compare at least four invitation risks, the planning quality, the tests, and final verification.
