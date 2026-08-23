# Minimal-Diff Evidence Template

## Before Editing

Record requested behavior, two allowed source paths, 30-line maximum, excluded paths, baseline command, and why shared cleanup is unnecessary. Commit the JSON and Markdown plan alone.

## Final Ledger

Record `planSha`, `sourceSha`, planned files and lines, actual files, additions, deletions, changed lines, and verification commands. Counts must come from the source commit, not the working tree.

## Avoided Work

Explain why checkout, destructive behavior, shared components, styles, and unrelated cleanup were intentionally left unchanged.

Also create `avoided-work.json` with one entry for each protected consumer or tempting shared path. Each entry contains `path`, `temptation`, `reason`, and `status: "unchanged"`.

## Required Before and After Files

- `evidence/before.md` records Starting commit, baseline Implementation commit, Agent and model, Tools and permissions, Time limit, Human hints: 0, Retries: 0, and Patch SHA-256.
- `evidence/before.patch` is the genuine unconstrained first-attempt diff.
- `evidence/before-scope.json` records files, additions, deletions, and changed lines reproduced from the patch.
- `evidence/after.md` records the same run fields plus Implementation commit, actual scope, line count, behavior, checks, and Patch SHA-256.
- `evidence/after.patch` is the genuine scope-limited diff.
- `evidence/comparison.md` uses `Same conditions`, `Before`, `After`, `Proof`, and `Conclusion` to compare scope, behavior, review cost, and verification.
