# Before: Unstructured Evidence Attempt

## Session conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: `133ca577d7323a17c0370b6e2f1886275c2dda2c` (branch `codex/exercise-08-01-pr-evidence-pack-automation-before`)
- Agent and model: opencode subagent session, model `opencode-go/glm-5.3` — same as the after attempt.
- Tools and permissions: file read/write plus bash; local repository only; no network, no global installs.
- Time limit: single sitting under the exercise's 45-minute target.
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch`
- Inputs provided: `fixtures/check-results.json` and a plain request to produce a PR evidence pack for the reviewer. The evidence contract, fixture guide, PR brief, action pins, and verifier scripts were not consulted for this attempt.

## What was produced

A hand-written pack in `evidence/` on the before branch: `pr-evidence.md` (reviewer summary), `pr-evidence.json` (hand-built JSON), copies of all four fixture artifacts under `evidence/artifacts/`, and a drift-prone copy of the fixture itself (`check-results-copy.json`). Seven files, 159 insertions.

## Proof table

| Proof | Result |
|---|---|
| Failed checks preserved | 1 of 1 (`checkout-smoke`, exit 1, visible in the markdown) |
| Commands with exit codes | 3 of 3 (recorded as prose and JSON fields) |
| Artifacts copied and hashed | 4 of 4 SHA-256 digests recorded — but 1 extra (`build.txt`) with no fixture check, and paths anchored to `evidence/artifacts/` rather than a stable pack-relative directory |
| Risk, reviewer action, and rollback present | Yes, copied verbatim from the fixture |
| Generator exit code | n/a — no generator exists; the failing exit status is prose a human must read, nothing returns non-zero to CI |
| Files changed | 7 |
| Lines added and removed | `+159 / -0` |

## What the unstructured attempt cannot guarantee

The content was accurate — failures, digests, and reviewer guidance all survived — but every failure-preserving property is unenforced:

- No `sourceSha`: the JSON records `"source": "fixtures/check-results.json"` instead of a commit, so the pack cannot be bound to the revision under review.
- No executable exit status: a markdown file cannot fail a check run; the assertion "treat this PR as failing" has no mechanical effect.
- No validation: nothing rejects a path-escaping `outputPath`, a rewritten `result`, or a missing artifact — accuracy depended entirely on the one-off session's diligence.
- Contract drift: the extra `build.txt` in the artifact directory and `evidence/artifacts/…` paths both violate the pack contract (`artifacts/<basename>` relative to the pack, exactly the fixture's artifacts).
- No workflow: nothing regenerates or uploads the pack, so the evidence ages immediately as the PR evolves.
