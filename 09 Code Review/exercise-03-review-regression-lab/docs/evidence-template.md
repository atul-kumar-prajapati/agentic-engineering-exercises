# Code Review Skill Evidence

## `evidence/before.md` and `evidence/after.md`

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch` or `evidence/after.patch`
- Patch SHA-256:

Record runner nonces, session IDs, case count, coverage, precision, clean-control blockers, and verification exit code.

## `evidence/comparison.md`

Confirm `Same conditions`. Compare `Before` and `After` misses, unsupported blockers, metrics, and review usefulness. Link the `Proof` to raw runs, transcripts, and scorecard. End with a clear `Conclusion` to adopt or reject the skill.

Generate `after.patch` with `git diff --binary --full-index <starting-commit> <implementation-commit>`.
