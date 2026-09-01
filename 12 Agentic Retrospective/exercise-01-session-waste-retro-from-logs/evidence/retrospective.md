# Retrospective

## Definition of preventable waste

A preventable call is one of three mutually exclusive event classes derived from ordered raw events (`docs/metric-contract.md:3-6`):

1. `duplicateReads` — a read after the first read of the same target and `contentVersion`. Seq 2 of the protected trace is the only baseline instance (`session-events.json:3`).
2. `unchanged failure` retries — the second or later identical command after failure at the same `workspaceRevision`, until a diagnosis event or revision change resets the count. Baseline seq 6 and seq 7 (`session-events.json:7-8`).
3. `oversizedContextLoads` — context events with more than 8,000 bytes. Baseline seq 3, 12400 bytes (`session-events.json:4`).

First reads, a new `contentVersion` after a write (`session-events.json:12`), the first failed command (`session-events.json:6`), and a retry after diagnosis (`session-events.json:10`) are useful work. The seeded analyzer counted all four reads and all three failures (`analyzeSession.mjs` at `52090ed`), which is the measurement defect this exercise corrects.

## Root cause

The largest preventable behavior in the baseline is the unchanged failure pair: `npm test -- policy` failed at workspaceRevision 1 (seq 5) and was repeated twice (seq 6–7) before diagnosis (seq 8). That is two preventable calls that an executable preflight can stop. Completing with a `claim` after the last write (seq 13, `session-events.json:14`) never produces `finalVerificationRuns`, so `correctnessPassed` stays false (`metric-contract.md:7-8`).

## Preflight

`evaluateCommandAttempt` (`preflightPolicy.mjs:41-55`) is evaluated before a command runs and does not rewrite traces. After a latest identical `event.target` at the same revision failed, it returns `DIAGNOSIS_OR_CHANGE_REQUIRED` until a later diagnosis exists (`preflight-contract.md:5`). First attempts, other commands, a new revision, and post-diagnosis attempts return `FIRST_OR_INFORMED_ATTEMPT`.

On the replay, seq 6 failed `npm test -- src/policy.test.ts` at revision 1 (`replay-events.json:42-49`). Preflight denied a same-revision retry. Seq 7 is diagnosis (`replay-events.json:50-56`); the write moves to revision 2 (`replay-events.json:57-64`); the later focused test passes there (`replay-events.json:65-72`).

## Correctness

Correctness requires at least one passed `final-verification` command after the last write, with no later write (`metric-contract.md:8`). Baseline: last write seq 10, then a claim — `finalVerificationRuns` 0, `correctnessPassed` false. Replay: last write seq 8, passed `npm run verify` at seq 10 (`replay-events.json:73-80`) — `finalVerificationRuns` 1, `correctnessPassed` true.

## Remaining waste

The chosen improvement is retry preflight, not context-window policy. Replay still has one oversized context load (`replay-events.json:1-8`, 14240 bytes). Duplicate reads dropped to 0 because this session did not re-read the same target+version; that category is still reported when it occurs (`replay-contract.md:7`). Preventable calls 4 → 1.
