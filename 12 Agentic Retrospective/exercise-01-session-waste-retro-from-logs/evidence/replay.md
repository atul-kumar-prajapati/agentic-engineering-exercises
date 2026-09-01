# Replay report — POLICY-217

A new session ran task POLICY-217 with the same agent (`coding-agent`), same model (`standard-reasoning`), same prompt hash (`sha256:4d9d67b790d3ed36a6044c4b39ac2cb16e03db8bbcd4998f8af820e32d749ec1`), and same 20-minute limit as `docs/session-metadata.json:2-7`. sessionId is `replay-policy-217`, not `baseline-policy-217`.

The replay session received `evaluateCommandAttempt` and the replay/preflight contracts. It did not receive `docs/session-events.json`, the previous spliced `replay-events.json`, or `after.json`.

## Before (protected baseline)

13 events in `docs/session-events.json`. Analyzer: duplicateReads 1, unchangedFailureRetries 2, oversizedContextLoads 1, preventableCalls 4, finalVerificationRuns 0, correctnessPassed false (`evidence/baseline.json`). Seq 13 claims completion without final verification (`session-events.json:14`).

## After (this session)

10 events in `evidence/replay-events.json`. Analyzer: duplicateReads 0, unchangedFailureRetries 0, oversizedContextLoads 1, preventableCalls 1, finalVerificationRuns 1, correctnessPassed true (`evidence/after.json`).

Required shape (`replay-contract.md:5`, `verify-retro-submission.mjs:26-27`):

- reads: seq 2–5 (`replay-events.json:10-41`)
- failed focused-test: seq 6 (`replay-events.json:42-49`)
- diagnosis: seq 7 (`replay-events.json:50-56`)
- later passed focused-test: seq 9 (`replay-events.json:65-72`)
- write: seq 8 (`replay-events.json:57-64`)
- passed final verification after the last write: seq 10 (`replay-events.json:73-80`)

Events were recorded once and not edited after `analyzeSession` ran. Payload overlap with the protected baseline is two same-task files (read/write `src/policy.ts`), not a score-shaped splice.
