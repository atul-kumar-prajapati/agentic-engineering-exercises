# Replay / evidence integrity handoff

Lane: replay evidence. Reviewer model: cursor-grok-4.6-high. Source: `9904a0a9a23333b8da2d4417a1febe79daf53359`.
First review cited the uncommitted spliced `evidence/replay-events.json`. Integration replaced that file, then re-derived metrics.

## Findings

| ID | Finding | Disposition | Evidence |
|---|---|---|---|
| F1 | `replay-events.json` was a score-shaped edit of `docs/session-events.json`: seq 1–5 copied, baseline retries seq 6–7 deleted, seq 8–12 renumbered −2, claim swapped for a passing `final-verification` | **Accept / fix** | `replay-contract.md:5`; README step 6. Integration confirmed 10 of 11 old replay payloads matched the baseline; only the final-verification event was new. Replaced with a 10-event new-session log. |

## After the fix (re-derived)

| Item | Result | Citation |
|---|---|---|
| HEAD / sourceSha | `9904a0a9a23333b8da2d4417a1febe79daf53359` | `git log -1`; `history.json` |
| `diff-tree` of sourceSha | exactly three retro files | `retro-verification.mjs:23-29` |
| Metadata match, new sessionId | PASS | `session-metadata.json:2-7` vs `replay-metadata.json:2-7`; sessionId `replay-policy-217` |
| Required types + failed then passed focused-test + FV after last write | PASS | `replay-events.json:10-80`; write seq 8, FV seq 10 |
| unchangedFailureRetries 0; preventable 4 → 1 | PASS | live `analyzeSession`; `retro-verification.mjs:12-14` |
| baseline.json / after.json deep-equal live analyzer | PASS | `verify-retro-submission.mjs:23-24` |
| Not a splice | PASS | payload overlap with baseline = 2 (read `src/policy.ts` v1, write `src/policy.ts` v2) |

## Dismissed (first review, still true after the fix)

| Probe | Why dismissed |
|---|---|
| sessionId collision | `replay-metadata.json:3` is `replay-policy-217` |
| Metadata field mismatch | five compared fields match |
| Duplicate reads / oversized context remaining | allowed remaining waste (`replay-contract.md:7`) |
| sourceSha extra files | `diff-tree` of `9904a0a` is the three retro files |
| Protected-file edits | none |

## Integration

Accept F1. Do not keep a spliced baseline. The replacement log was produced without reading `docs/session-events.json`; preflight denied a same-revision retry after seq 6; the file was not edited after analysis. Remaining waste is the oversized `src/` context load (`replay-events.json:6`).
