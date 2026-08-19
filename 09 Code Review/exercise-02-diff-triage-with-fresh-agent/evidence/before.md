# Before — Independent Diff Triage Baseline

## Review range (from the protected bundle)

- **Base SHA:** 8911d1064f74bdc7f0d4e88a2e57f122830ef6f2 (`review-base`)
- **Head SHA:** 8242a84ad8735d1a9c5051e1916d86c1c95101af (`review-head`)
- **Comparison:** `review-base..review-head`
- **Fixture check:** `node scripts/verify-review-fixture.mjs` → `Fresh-review fixture verified: review-base..review-head`, exit code: 0. Full output in `evidence/fixture-verification.txt`.
- **Protected diff:** `evidence/before.patch` is a byte copy of `pr/review-target.diff`, which the fixture verifier proves matches `git diff 8911d10 8242a84` exactly.

## Fresh reviewer session conditions

- **Reviewer agent and model:** opencode subagent (general lane), model glm-5.3 (opencode-go/glm-5.3); integration owner also opencode glm-5.3.
- **Tools:** read-only file access to an isolated sandbox; no repo history, no implementation chat, no earlier reviews.
- **Permissions:** read-only — reviewer could not create, edit, or delete files.
- **Time limit:** 45 minutes (completed well within it).
- **Context provided:** exactly `docs/review-brief.md`, `fixtures/manifest.json`, `pr/review-target.diff`, plus the mounted head source at 8242a84 for reproduction.
- **Excluded context:** `docs/implementer-notes.md`, earlier reviews, expected finding IDs, implementation chat.
- **Exact prompt:** preserved verbatim in `evidence/fresh-review-prompt.md`, SHA-256 `da65780380de56a31bc6c4557da558da24eff32e26bca9981d8ab7e3bf7916bc` (bound in `evidence/reviewer-session.json`).

## Baseline command results on the risky head (working tree identical to 8242a84 for `src/App.tsx` and `src/services/workflowApi.ts`, verified by `diff` against `git show 8242a84:...`)

| Command | Result | Exit code |
|---|---|---|
| `npm ci` | installed, 0 vulnerabilities | 0 |
| `npm run test:integrity` | Verified 42 protected challenge inputs. | 0 |
| `npm run test:cache` | **4/4 protected cache acceptance tests FAILED** (malformed/non-array JSON, fixture mutation on sort, save persistence, evidence read-only); `run-app-cache-checks.mjs` failed: filter changes must not delete persisted workflow data | 1 |
| `npm run agent:check` | all quality gates passed (integrity, lint, test, format, typecheck, build) | 0 |

The seeded cache blockers are invisible to the app's quality gates (`agent:check` exit 0 on the vulnerable head); only `test:cache` catches them. This is the baseline the fresh review started from.

## Fresh reviewer outcome (see `evidence/review.json` and `evidence/review.md`)

The fresh session independently derived four merge blockers — CACHE-001 (`src/App.tsx:41` destructive filter effect), CACHE-002 (`src/services/workflowApi.ts:10` unguarded `JSON.parse`), CACHE-003 (`src/services/workflowApi.ts:13` in-place fixture sort), CACHE-004 (`src/services/workflowApi.ts:37` stale cache write in evidence collection) — and, when asked directly, proved that `saveAction` returns a new object and does not mutate the shared fixture (CLAIM-001 dismissed). Merge decision: request changes.
