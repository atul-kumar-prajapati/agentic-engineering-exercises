# Workflow Optimizer Evidence

Use full Git SHAs, exact run settings, response hashes, token counts, durations, generated grades, commands, and exit codes.

## `evidence/before.md` and `evidence/after.md`

Record workflow commit and hash, agent and model, settings, tools and permissions, time limit, case count, runs per case, raw response count, quality score, critical failures, variance, median tokens, median duration, patch path, files changed, and lines added and removed.

## `comparison.md`

Confirm conditions differ only by the workflow. Compare training and held-out quality, critical failures, variance, tokens, duration, unsupported completion claims, and workflow size. State the adoption decision from the generated benchmark.

The required final path is `evidence/comparison.md`. Keep genuine Git diffs at `evidence/before.patch` and `evidence/after.patch` and record both paths in the matching run files.
