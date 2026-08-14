# Code Review Regression Evidence

Use full Git SHAs, exact provider settings, response hashes, commands, exit codes, and generated metrics.

## `evidence/before.md` and `evidence/after.md`

Record starting commit, prompt commit, provider, model, temperature, tools, permissions, cache setting, samples per case, prompt hash, patch path, response count, and command exit codes.

| Metric | Historical | Multi-bug | Clean control |
|---|---:|---:|---:|
| Recall or precision | | | |
| False blockers | | | |
| Variance | | | |

Use `evidence/before.patch` for the baseline candidate and `evidence/after.patch` for the final candidate.

## `evidence/comparison.md`

Confirm identical evaluation conditions. Compare recall, clean precision, false blockers, variance, threshold status, and prompt size. State the adoption decision from the generated scorecard.
