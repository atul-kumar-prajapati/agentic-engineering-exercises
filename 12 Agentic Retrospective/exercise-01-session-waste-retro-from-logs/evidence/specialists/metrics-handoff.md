# Metrics / classification handoff

Lane: metrics. Reviewer model: cursor-grok-4.6-high. Source: `9904a0a9a23333b8da2d4417a1febe79daf53359`.
Verification: `npm run test:analysis` exit 0 (re-run by integration).

## Findings

None.

## Dismissed (recorded so the clean verdict is a review)

| ID | Concern | Disposition | Evidence |
|---|---|---|---|
| M1 | Revision reset is identity-keyed (`target::workspaceRevision`) rather than a global latch on write | Dismiss | `analyzeSession.mjs:33-35,48-50,70-72`. For monotonic revisions this equals a revision change. A return to an old revision still matching `metric-contract.md:4` is correct. |
| M2 | Required-field rejection is not exhaustive (`target` / `result` / `contentVersion`) | Dismiss | Protected suite only requires sequence and context `bytes` (`run-analysis-tests.mjs:36-37`; `metric-contract.md:10`). The 13-event trace is accepted. |
| M3 | Phase is not part of command identity | Dismiss | `metric-contract.md:4` is the command string. `analyzeSession.mjs:33-35,75-81`. |
| M4 | A pass does not reset retry state | Dismiss | Matches `metric-contract.md:4` (diagnosis or revision). Integration re-derived: fail → pass → fail at one revision ⇒ `unchangedFailureRetries` 1. This is the real delta vs the before attempt, which cleared the key on pass. |
| M5 | Final verification with no writes counts (`lastWriteSequence` starts at `-Infinity`) | Dismiss | Vacuous “after the final write”. Not in the protected trace (`session-events.json:11` has a write). |

## Integration

Accept the PASS. No analyzer edits. Independent recount: 13 events, 2× `policy.ts` v1 (one duplicate), 3 failed focused tests (2 retries), context 12400, last event a claim. Eight local probes held (8000-byte boundary, verification-then-write, no-write verification, fail–pass–fail, diagnosis reset, new-version read).
