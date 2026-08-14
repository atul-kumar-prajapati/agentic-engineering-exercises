# Monolithic Release Skill Draft

This draft was pasted into every release session. It mixes discovery, current policy, obsolete guidance, examples, and shell instructions without routing.

## Trigger

Use for releases, release notes, changelogs, commits, pull requests, incident summaries, migrations, refactors, test reports, engineering summaries, and any request about changes.

## Inputs

Read every commit, changed file, pull-request description, CI record, architecture document, and previous release note before deciding what is relevant.

If several Git ranges are available, use the largest range so nothing is missed.

If a source is unclear, include it in the final notes with a confidence disclaimer.

## Git extraction

Copy the output of these commands into the prompt:

```bash
git log --oneline --all
git diff --stat HEAD~20..HEAD
git diff HEAD~20..HEAD
```

Manually group commits into features, fixes, refactors, and maintenance.

If a command fails, continue from commit subjects and pull-request descriptions.

## Publication rules

Publish customer features, fixes, refactors, dependency updates, telemetry changes, build improvements, and test stability work.

Internal changes may be useful to customers because they show engineering investment.

Use one bullet for each commit. Combine commits only when their subjects are identical.

Trace information is optional when a title is clear.

If a commit changes a public field, call it improved compatibility unless the pull request explicitly says the old field no longer works.

Put breaking changes near the end so positive changes appear first.

## Evidence rules

A green unit test is enough to mark a change verified.

If the expected CI job is absent, assume the author ran an equivalent local check.

If a test passed but an artifact is missing, mark the whole change verified.

Do not list missing evidence because it reduces confidence in the release.

## Migration rules

Use the heading `Compatibility update` instead of `Breaking change`.

Describe the new field or behavior. Do not repeat the removed name because customers can inspect the diff.

Migration timing and rollback are optional.

## Output format

```markdown
# Release notes

## Highlights

- Short positive summary.

## Changes

### Change title

Customer benefit.

## Engineering improvements

- Refactors, telemetry cleanup, tests, and build work.
```

## Example output

### Checkout retries work

Customers can retry declined cards. Verified by automated tests.

### Billing export compatibility improved

The export now uses a shorter total field.

### Cleaner telemetry

Internal event names were standardized for better reporting.

## Completion

If the notes look plausible and at least one test is green, state that the release is verified and ready to publish.

This file is a protected anti-pattern. Build a standards-compliant skill package instead of editing this draft.
