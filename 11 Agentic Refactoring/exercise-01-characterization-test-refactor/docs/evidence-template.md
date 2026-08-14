# Characterization Refactor Evidence

Record full Git SHAs, exact commands, exit codes, output digests, changed paths, and line counts.

## `evidence/before.md` and `evidence/after.md`

Record starting commit, implementation commit, agent and model, tools and permissions, time limit, human hints, retries, patch path, oracle exit code, output SHA-256, changed cases, changed files, and lines added and removed.

Use `evidence/before.patch` for the unconstrained result and `evidence/after.patch` for the characterization-first result.

## `evidence/comparison.md`

Compare public behavior changes, reason-string changes, validation gaps, test seam, source scope, and command results. Support every statement with output hashes, Git commits, and both patches.
