# Selector semantics handoff

Reviewer: `cursor-grok-4.6-high` (read-only). Citation tree: `selectContext.mjs` and tests on disk at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20` (verifier imports this working-tree selector; no bundle). Integration owner re-derived lines against those files. One reviewer range started one line early (`tests/context-selector.test.mjs:14` is the call; ID order is `:15`) — corrected below.

**Verdict (reviewer): PASS.** Integration: **accept.** `npm run test:context` exit 0 independently confirmed.

## Behavior pins

| Behavior | Selector | Test |
|---|---|---|
| Mandatory-first | `selectContext.mjs:34-47`, overflow `:42-43` | learner `:15-17`; protected `run-context-tests.mjs:15-16` |
| Priority then stable id | `:7-8`, used `:36` and `:57` | learner `:29-32`; protected `:22-23` |
| Stale never selected | relevant/mandatory require `authority === "current"` (`:53`, `:35`); skip `:73` | protected `:19`; learner `:22` |
| Skip reasons | `:68-76` stale / overlap→budget / else irrelevant | learner `:22-24`, `:34`, `:43`, `:48`; protected `:20`, `:28` |
| Tight `unresolvedTags` | `:79-80` | learner `:41-44`; protected `:26-29` |
| Question expansion | `:30-32` merge `questions` into `requestedTags` | learner `:29-35`, `:37-39`; protected `:22-24` |
| Duplicate throw | `:25-28` | learner `:51`; protected `:34` |
| Non-positive maximumBytes | `:21-23` | learner `:52-53`; protected `:35` |
| Order independence | sorts at `:36`, `:57`, `:70`; tags `:3-4` | learner `:26-27`; protected `:31-32` |
| Byte totals | `:78`, `:86` | learner `:18-19`, `:31`, `:56-59`; protected `:17-18`, `:24`, `:10-13` |

## Findings

None to fix. Cannot add tests after `sourceSha`.

## Dismissed / deferred

1. **Stale higher-priority source could be selected.** Dismiss. Both filters require `authority === "current"` (`selectContext.mjs:35`, `:53`).
2. **Over-budget relevant item labeled `irrelevant`.** Dismiss. Overlap branch is `:74` (`"budget"`). Tight adapter skip is learner `:43` and protected `:28`.
3. **Reversed tags break `deepEqual`.** Dismiss. `uniqueSorted` at `:3-4` / `:32`.
4. **Equal-priority id tie-break untested.** Defer. Comparator is `:8`; this catalog has six distinct priorities. Cannot change learner tests after `sourceSha`.
5. **Exact-fit `bytes === remaining` untested.** Dismiss. Predicate is `>` at `:42` and `:60`, so an exact fit is kept.
6. **`continue` vs `break` on over-budget relevant.** Dismiss. Spec is priority-then-fill remaining; `continue` at `:61` matches. This catalog has no pair that distinguishes the two.
