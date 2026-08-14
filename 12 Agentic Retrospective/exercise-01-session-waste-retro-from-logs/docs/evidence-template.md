# Session Waste Evidence

Use full Git SHAs, exact session conditions, event IDs, commands, exit codes, token or byte counts, and analyzer-generated metrics.

## `evidence/before.md` and `evidence/after.md`

Record starting commit, implementation commit, agent and model, tools and permissions, time limit, raw event file and hash, patch path, duplicate reads, unchanged failed-command retries, oversized context loads, total preventable calls, final verification position and result, files changed, and lines added and removed.

## `evidence/comparison.md`

Confirm matching replay conditions. Compare each preventable category, total calls, context bytes, correctness, and final verification timing. Cite raw event IDs and both patches.

Use genuine Git diffs at `evidence/before.patch` and `evidence/after.patch`; record both paths in the matching Markdown run files.
