# Session Metric Contract

- `duplicateReads`: a read after the first read of the same target and `contentVersion`. A new version is useful.
- `unchangedFailureRetries`: the second or later identical command after failure at the same `workspaceRevision`, until a diagnosis event or revision change resets it.
- `oversizedContextLoads`: context events with more than 8,000 bytes.
- `preventableCalls`: the sum of those three mutually exclusive event categories.
- `finalVerificationRuns`: passed commands with phase `final-verification` after the final write.
- `correctnessPassed`: true only when at least one such final verification exists and no later write follows it.

Every metric is derived from ordered raw events. The analyzer must reject duplicate or non-increasing sequence numbers and malformed required fields.
