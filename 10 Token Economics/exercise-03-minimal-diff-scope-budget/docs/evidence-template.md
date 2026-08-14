# Minimal-Diff Evidence Template

## Before Editing

Record requested behavior, two allowed source paths, 40-line maximum, excluded paths, baseline command, and why shared cleanup is unnecessary. Commit the JSON and Markdown plan alone.

## Final Ledger

Record `planSha`, `sourceSha`, planned files and lines, actual files, additions, deletions, changed lines, and verification commands. Counts must come from the source commit, not the working tree.

## Avoided Work

Explain why checkout, destructive behavior, shared components, styles, and unrelated cleanup were intentionally left unchanged.

## Required Before and After Files

- `evidence/before.md` records the unconstrained run conditions, changed paths, added-plus-deleted lines, behavior changes, and command exit codes.
- `evidence/before.patch` is the genuine unconstrained first-attempt diff.
- `evidence/after.md` records the matching budgeted run conditions, actual scope, line count, behavior, and checks.
- `evidence/after.patch` is the genuine scope-limited diff.
- `evidence/comparison.md` compares scope, behavior, review cost, and verification.
