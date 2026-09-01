# Comparison — Unconstrained vs Characterization-First (Exercise 11.1)

## Same conditions

Both attempts ran as fresh opencode general task subagents on opencode-go/glm-5.3, in dedicated isolated Git worktrees from the same starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`, with identical tools and permissions (file read/write and bash covering git, node, npm; no network), the identical team request quoted below, a 45-minute time limit, zero human hints, and a genuine first-attempt patch each (`Human hints: 0`, `Retries: 0` in both `before.md` and `after.md`).

> "Your team needs a complex renewal rule simplified, but nobody can confirm which surprising behaviors current callers depend on. Refactor the internal decision structure of `evaluateRenewalEligibility` in `rules-refactor-app/src/rules/legacyEligibility.mjs` without changing any observable result. The function allows support overrides, accepts negative late-payment counts, and rejects some mature accounts as `plan-not-supported`. These may be bugs, but this task does not authorize behavior changes."

The single independent variable is the workflow input. The before run received only the request, in a sparse checkout exposing nothing but the application source. The after run received the same request plus the repo's own characterization-first contract — the committed public test and `before-output.json` baseline and the instruction to keep them green and byte-identical. Leakage was controlled in the other direction too: the after run did not receive the before implementation, `before.patch`, or any explanation of the first attempt — the before attempt lived in a worktree it never saw and had not been reviewed when its session started.

## Before result, reviewed on the six dimensions the README names

The before attempt (`bf7b280`, patch SHA-256 `8bb2ade…`) refactored the module into a first-match-wins rule table and, finding no test suite in its checkout, self-invented a differential harness with an embedded copy of the pre-refactor implementation as oracle.

1. **Changed outputs — none on any stable-property input; a real divergence class on stateful-accessor inputs.** The exercise oracle run by me against the before branch exits 0 and its `--json` output is byte-identical to the baseline (SHA-256 `5ce2ade…`); my sweep over 49,392 stable-property input variations found zero divergences. But for inputs whose property access is stateful — a `tier` getter that returns `enterprise` on first read and `pro` afterwards, or a read-once Proxy — the before refactor's independently-evaluated predicates re-read properties the original reads once, changing results: original `plan-not-supported` vs before `eligible`/`pro-tenure` (stateful tier, 6 months, 0 late) and original `plan-not-supported` vs before `manual-review`/`payment-history` (stateful monthsActive, enterprise, 5 late); a Proxy whose get trap throws on second read throws under the refactor where the original returns normally. Re-derived by the integration owner with a reproducer (`evidence/commands/stateful-accessor-parity.txt`), independently found by the before-attempt review lane. All ten golden observations use plain data and are unaffected.
2. **Reason strings — unchanged.** All five reason strings (`legacy-support-override`, `enterprise-tenure`, `payment-history`, `pro-tenure`, `plan-not-supported`) are preserved verbatim on every stable-property input in the sweep.
3. **Validation gaps — preserved.** Negative `latePayments` still passes enterprise's `< 2` check; no validation was added. Covered by the sweep (negative, fractional, numeric-string, boolean, and `undefined` late-payment values).
4. **Decision order — preserved.** Its table matches the original precedence: support override first, enterprise tenure, enterprise manual review, pro tenure, default.
5. **Public API — preserved.** One named export, same signature, fresh result object per call, same key order.
6. **Tests coupled to private helpers — the seam difference.** Its harness imports only the public export, but its oracle is a *verbatim frozen copy of the implementation source* pasted into the test file, and its 21 "documented behaviors" are self-derived observations, not the protected golden cases. The review lane additionally found the harness blind in exactly the places that hid the dimension-1 divergence: its input grid constructs only plain data objects (no getters or Proxies), its "sparse" grid variant is a mislabel that actually copies all four keys (so key-absent accounts enter only through two named cases), and its comparator checks only the three field values — not key order, extra properties, or error types on the throw checks.

## What the unconstrained run cannot enforce

The honest headline has two parts.

First, on the protected observations, this unconstrained attempt happened not to change behavior — but that is a property of the agent's care, not of the workflow, and its own artifacts show what was missing:

- **No baseline preceded the edit.** Nothing was committed before the production change, so nothing binds the claim "unchanged" to an auditable pre-edit state; its parity proof exists only inside its own after-the-fact harness.
- **No authoritative oracle.** The protected golden observations were withheld, so even its self-invented test asserts against its own assumptions. (Its embedded oracle copy is in fact faithful — the review lane and I both verified this — but nothing guaranteed it.)
- **No gate integration.** Its `package.json`, scripts, and CI entry points were invisible to it; its harness cannot fail a build, block a merge, or run in `verify:exercise`. A drifted unconstrained refactor would merge green.
- **No scope discipline.** Its single commit mixes a production refactor with a 225-line test file; the exercise's refactor contract (one source-only commit) is enforced by nothing in its environment.
- **No history proof.** Even with a perfect result, it produces no commit ordering a verifier can check.

Second — and this is the sharpest finding of the exercise — its harness reported "17,687 comparisons, all outputs identical" while a real divergence class existed. The blind spots were not random: a self-invented net tests what its author thought to test, and its author did not think of stateful property access. A characterization net built from *observed caller behavior* (the golden cases) has the opposite failure mode — it cannot exceed what callers were observed doing, but it is authoritative for exactly those observations and is wired into gates that fail the build. Neither net is complete; the protected net is the one the repository can enforce.

## After result

The characterization-first attempt (`550e1a2`, patch SHA-256 `43403942…`) operated inside every constraint the before run lacked: the safety net (`af05bfa`) was committed before any production edit, the refactor commit changes exactly one file, `after-output.json` is byte-identical to `before-output.json` (both SHA-256 `5ce2ade…`), and `npm run refactor:verify` plus `npm run verify:exercise` enforce the history, scope, and parity rules as gates. Test seam: the committed characterization test calls only the public export and asserts the protected golden observations.

It shares one limitation with the before attempt, found by the behavior-parity lane and re-derived by me: its decision table also re-reads `tier` (up to 3×) and `monthsActive` (up to 2×) where the original's else-if cascade reads each property at most once per branch, so the same stateful-accessor inputs diverge (`evidence/commands/stateful-accessor-parity.txt`). This class lies beyond the protected golden observations — the exercise's definition of observed behavior — and no gate covers it; the module was left untouched because post-hoc integration edits would contaminate the first-attempt conditions the exercise mandates. The finding is recorded as a deferred follow-up (a read-parity-faithful structure that preserves the original's single-read semantics) in `evidence/integration.md`, alongside the preserve/suspected-bug decisions in `evidence/behavior-decisions.md`.

## Proof

- Starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`; before implementation `bf7b2802a450440b6aacfd78cef7cc05a1d83cd2`; characterization `af05bfacf17d1b37ba99e50996cc5686f2772683`; refactor `550e1a2e4f5254375fe6360771ad260d9c4d34c2`.
- `evidence/before.patch` (12,678 bytes, SHA-256 `8bb2ade…`) and `evidence/after.patch` (8,507 bytes, SHA-256 `43403942…`) are the exact `git diff --binary --full-index <starting> <implementation>` of their runs, differ from each other, and both apply cleanly to the starting commit.
- Oracle on the before branch — exit code: 0; oracle and characterization test on the after branch — exit code: 0; `before-output.json` vs `after-output.json` — byte-identical; parity sweep over 49,392 stable-property input variations — zero divergences for both refactors; stateful-accessor reproducer — divergences for both refactors, identical to original on the plain-data control.
- Command captures with exit codes live in `evidence/commands/`; gate results in `evidence/verification.md`.

## Conclusion

Under matched conditions, both attempts preserved all ten protected observations and every plain-data output — but only the characterization-first run *proves* it in a way that survives the agent leaving the room: a pre-committed baseline, an authoritative oracle wired into gates, a single-file refactor commit, and verifier-enforced history. The unconstrained run's safety was incidental and unenforceable, and its self-invented 17,687-comparison harness declared "all outputs identical" while a real (if exotic) divergence class existed — the precise failure mode of a net that tests the author's assumptions instead of observed behavior. The residual finding cuts both ways: stateful-accessor inputs diverge under *both* refactors, beyond what the golden observations protect, and that gap is now documented as a deferred follow-up rather than silently shipped. The safety net must be committed before production edits — and its coverage boundary, not just its pass count, is part of what the workflow owes its reviewers.

## Session transparency

Two discarded launches are disclosed in `before.md`: a preliminary before-attempt whose prompt (my error) granted access to the exercise's own instructions, making it a contaminated run of the characterization-first workflow rather than an unconstrained attempt, and one hollow relaunch that returned an empty report with zero commits (a failed subagent invocation, not an agent attempt). Neither contributed work, commits, or text to this evidence pack; the recorded before attempt is the isolated run whose uncorrected result stands above.
