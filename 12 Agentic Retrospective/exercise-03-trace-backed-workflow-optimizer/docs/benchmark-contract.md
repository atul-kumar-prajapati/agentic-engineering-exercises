# Workflow Benchmark Contract

Each lane contains three runs for every protected case. Corresponding runs use the same `agent`, `model`, `settingsHash`, `toolsHash`, `permissionsHash`, `timeLimitMinutes`, and source task. Baseline uses `baselineSha`; candidate uses its one-file `candidateSha`.

Each run records `caseId`, `run`, conditions, `repositorySha`, `workflowSha256`, positive integer `tokens` and `durationMs`, structured `response`, and `responseSha256` over compact JSON serialization of that response.

The scorer derives every assertion from response actions and findings. Passing requires candidate train quality at least 0.85, held-out quality at least 0.90, at least 0.10 improvement on both splits, every held-out critical grade passing, held-out run-quality standard deviation at most 0.20, median tokens no more than 1.25 times baseline, and median duration no more than 1.50 times baseline.

Candidate instructions must remain below 120 lines and 1,800 words and may not contain case IDs or assertion IDs.
