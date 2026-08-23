# Routing Measurement Contract

The protected `evals/recorded-runs.json` contains 36 response-bound benchmark observations. They are curated synthetic inputs for reproducible offline scoring, not production-provider telemetry. Create `evidence/routing-measurements.json` with one entry for every observation. Preserve its sample key, response hash, input/output tokens, latency, quality score, and safety result, then calculate `callCostUsd` from `evals/pricing.json`.

Create `evidence/measurement-run.json` with `schemaVersion: 1`, pack ID, SHA-256 of the exact pack bytes, `runsPerLane: 3`, `scorerVersion: 1`, and the focused router source SHA.

The scorer prices every first call and adds the expected cost and latency of one escalation when a selected run misses its quality floor or safety check. Fast escalates to balanced, balanced to reasoning, and reasoning retries once on reasoning. Results are the mean of three runs. Do not edit the generated cost model.

This pack makes cost results deterministic and free to run. A bring-your-own-key experiment may be documented separately, but it is outside verification.
