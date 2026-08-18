# Comparison: Unstructured vs Automated Failure-Preserving Evidence

## Matching run conditions

Both attempts used the same agent type (opencode subagent session), the same model (`opencode-go/glm-5.3`), the same tools (file read/write, bash) and permissions (local repository only), the same 45-minute single-sitting target, the same first-attempt rule (0 human hints, 0 retries), and the same starting commit `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`. The only difference is the independent variable: the before session received the fixture and a plain request; the after session additionally received the repository's own contracts (evidence contract, fixture guide, PR brief, action pins, verifier). Full conditions: `evidence/before.md`, `evidence/after.md`.

## What each attempt produced

| Dimension | Before (`evidence/before.patch`) | After (`evidence/after.patch`) |
|---|---|---|
| Deliverable | 7 hand-written files, +159 lines | 2 files (generator, workflow), +205 lines |
| Commit binding | none — `"source"` names the fixture path, no SHA | `sourceSha: 70def5638a1604d0d1e8708bc7f5016674144403` in every generated pack |
| Failure exit status | prose only; nothing can fail CI | `process.exitCode = 1`; workflow step fails, job stays red |
| CI workflow | absent | read-only, SHA-pinned, `if: always()` verify + upload |
| Validation | none | rejects path escape, result/exitCode mismatch, duplicate names, missing artifacts, bad SHA |

## Omitted checks and changed results

None in either attempt — the before session copied all three checks faithfully, including the `checkout-smoke` failure. The exercise's seeded risk (a green-looking PR) is therefore not about a careless summary; it is about what a correct-looking summary cannot enforce. Both facts are recorded here rather than manufacturing a worse before attempt.

## Missing artifacts and digest coverage

Both attempts recorded SHA-256 digests for every fixture artifact. The before attempt additionally copied `build.txt` (no fixture check references it) into `evidence/artifacts/` and anchored artifact paths at `evidence/artifacts/…`; under the pack contract this counts as contract drift — the generated pack's `artifacts/` directory must contain exactly the fixture's artifacts with pack-relative paths, which `evidence/generated/pr-evidence.json` satisfies and the hand-built JSON does not (`evidence/artifacts/build.txt` would fail the harness's unexpected-file check).

## Failure exit status

- Before: `overallExitCode: 1` exists as a JSON number and a bold sentence. No process returns it; no workflow consumes it. A reviewer skimming past the bold text merges on the two passing checks.
- After: the generator exits 1 after writing the complete pack (`evidence/generated/pr-evidence.json`, `summary.md`, artifacts). In CI the generate step fails; verification and upload still run under `if: always()` without `continue-on-error`, so the evidence is published while the job remains failed. The failure is mechanically impossible to hide.

## Reviewer guidance

Both attempts preserved per-check risk, reviewer action, and rollback verbatim. The difference is provenance: after, each guidance string sits next to a commit-bound artifact digest in `evidence/generated/summary.md`, so a reviewer can re-derive every claim (`git show <sha>:<path>`, `shasum -a 256`) instead of trusting the summarizer.

## Workflow behavior

Before: no workflow exists, so evidence is never regenerated as the PR evolves — the pack ages immediately. After: `.github/workflows/evidence-led-pr-01.yml` triggers only on this exercise or the workflow itself, grants `contents: read` only, pins checkout/setup-node/upload-artifact to the protected 40-character SHAs, runs `npm ci` and the generator with `github.sha`, verifies with `if: always()`, and uploads `evidence/generated` with `if-no-files-found: error` and a SHA-bearing artifact name.

## Conclusion

Content accuracy was never the differentiator — enforcement is. The unstructured attempt produced an honest document with no mechanism behind it; the automated attempt produced slightly less prose and a system in which the failing exit code survives to CI, evidence is commit-bound, and invalid inputs are rejected instead of summarized.
