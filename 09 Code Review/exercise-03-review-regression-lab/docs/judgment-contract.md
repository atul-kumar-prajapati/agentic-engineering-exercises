# Response Judgment Contract

Create one judgment for every normalized Promptfoo response. Use the sample key emitted from its prompt label, case ID, and run number.

Each judgment contains `sampleKey`, `responseSha256`, `foundFindingIds`, `falseBlocker`, `reviewer`, and a concrete rationale. For bad cases, list only findings actually supported by the response. For the clean control, leave findings empty and set `falseBlocker` when the response recommends blocking the safe immutable-sort change.

Do not award credit for checklist words, vague suspicion, or a finding without the failure behavior. A second human must resolve inconsistent samples or disputed labels before scoring.
