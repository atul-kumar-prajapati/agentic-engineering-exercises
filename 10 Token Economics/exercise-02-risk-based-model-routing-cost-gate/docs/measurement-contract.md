# Routing Measurement Contract

Create `evidence/raw-responses.json` as a map from `case:tier:run` to the exact model response. Create one `raw-runs.json` entry for every eligible case/tier/run with the same key, provider, model, response SHA-256, input/output tokens, latency, quality score, safety result, and grading rationale.

Use one provider family, fixed model per tier, temperature, and prompt version. Runs must have positive latency and token counts. Local, file, echo, or executable providers are not eligible evidence.

The protected scorer prices every call, averages first-call outcomes, and adds expected retry or escalation cost when a selected tier misses its quality floor or safety check. Do not edit the generated cost model.
