# Before Attempt — Unconstrained Agent Refactor (Exercise 11.1)

The unconstrained run: a fresh coding agent received the team's refactor request cold, with every exercise contract withheld, and its uncorrected first attempt was recorded.

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `bf7b2802a450440b6aacfd78cef7cc05a1d83cd2`
- Agent and model: opencode general task subagent on opencode-go/glm-5.3
- Tools and permissions: file read/write and bash (git, node, npm); no network; dedicated isolated Git worktree
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch SHA-256: `8bb2adeead7f61ffbf30600f3ab7778b1ecee9a1b274ecf4b2fbf15728f2e957`
- Patch path: evidence/before.patch
- Oracle exit code: 0
- Output SHA-256: `5ce2adedc6dcb063b8ba99dbb1a2bbd49755e3e92437548b806dcea56aa98bab`
- Changed cases: 0 of 10 golden observations changed
- Changed files: legacyEligibility.mjs (modified, +25/−23) and legacyEligibility.characterization.mjs (added, +225) — the patch and the implementation commit are the same single commit here
- Lines added and removed: 250 added, 23 removed

## What the run received

Only the team's request, quoted verbatim in `evidence/comparison.md`. The checkout it worked in was a sparse Git worktree exposing **only** `rules-refactor-app/src/` (with `src/labContract.ts` withheld via a negated sparse pattern, because it restates the exercise workflow). It did not receive the exercise README, `docs/legacy-behavior-notes.md`, `docs/renewal-golden-cases.json`, the lab contract, `package.json` or any verification script, the evidence template, or any test suite.

## What the agent did (its own report, verified by me)

It refactored `legacyEligibility.mjs` into an ordered first-match-wins rule table (`renewalRules` + `unsupportedPlanOutcome`), preserving the export and, as it turned out, every observable output. Because no test suite existed in its checkout, it self-invented a dependency-free differential harness (`legacyEligibility.characterization.mjs`) embedding a frozen copy of the pre-refactor implementation as an oracle, and reported 17,687 comparisons passing before and after its change.

## Verification of the attempt (integration owner, re-derived)

- `git diff-tree --no-commit-id --name-status -r bf7b280` — exactly two files (the module plus its new harness).
- Its harness run by me — `node legacyEligibility.characterization.mjs` — exit code: 0 ("17687 comparisons").
- The exercise oracle run by me against the before branch — `node ./scripts/run-characterization-oracle.mjs` — exit code: 0, and `--json` output SHA-256 `5ce2ade…`, byte-identical to the baseline.
- My independent parity sweep (49,392 input variations, seven tiers including `undefined`/`null`/empty, fourteen tenure values, fourteen late-payment values including negatives/fractions/numeric strings/booleans, six override values, six object shapes) — zero divergences from the starting implementation.

So this unconstrained attempt preserved every stable-property output and all ten golden observations. Two critical observations for `evidence/comparison.md` follow. First, **nothing in its environment would have caught a drift** — no committed baseline preceded its edit, its oracle is a self-derived copy rather than the protected golden observations, and its harness is wired into no gate. Second, a drift *did* exist that its 17,687-comparison harness could not see: for stateful-accessor inputs (a `tier` or `monthsActive` getter returning different values per read, or a read-once Proxy), its table's independently-evaluated predicates re-read properties the original reads once, changing results (original `plan-not-supported` vs `eligible`/`pro-tenure` and `manual-review`/`payment-history`; a second-read-throwing Proxy throws where the original returns). Re-derived by the integration owner and independently found by the before-attempt review lane — see `evidence/commands/stateful-accessor-parity.txt`.

## Session notes (disclosures)

A preliminary before-attempt was discarded before being recorded anywhere in this evidence pack. Its prompt (my error) granted read access to the whole exercise directory, and the agent duly read the exercise README and lab contract and executed the exercise's own characterization-first workflow — a contaminated run in which the independent variable was destroyed. The recorded run above is the redo with every contract withheld; its result was accepted as produced and was never corrected or re-run. One relaunch of the isolated run returned an empty report with zero commits and zero working-tree changes (a failed subagent invocation, not an agent attempt) and is likewise disclosed here rather than silently dropped. The field values above describe the recorded run only.
