# Repository Rule Hardening Evidence

Use full Git SHAs, exact session conditions, patch hashes, correction-event IDs, commands, and exit codes. Do not edit either agent patch.

## `evidence/before.md` and `evidence/after.md`

Record starting commit, guidance commit if present, agent and model, tools and permissions, time limit, human hints, retries, exact task hash, patch path and SHA-256, detected defect IDs, grader exit code, files changed, and lines added and removed.

## `comparison.md`

Confirm both runs differ only by guidance. Compare stable identity, status normalization, clock injection, exception handling, defect count, scope, and checks. Map every improvement to an exact guidance line and correction-event IDs.

The required final path is `evidence/comparison.md`. Keep the genuine agent diffs at `evidence/before.patch` and `evidence/after.patch` and record both paths in the matching run files.
