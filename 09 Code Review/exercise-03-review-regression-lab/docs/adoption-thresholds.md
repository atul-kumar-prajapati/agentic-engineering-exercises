# Review Prompt Adoption Thresholds

Record the model, provider configuration, temperature, sample count, prompt commit, and raw report path.

- Historical and multi-bug recall: at least 80% across three sampled runs.
- Clean-control precision: at least 90%; a blocker on the clean control is a failure.
- Regression limit: no metric may fall more than five percentage points below the previous prompt.
- Human review: required for disagreements between sampled runs or any newly introduced blocker.

Use `report-template.md` for before and after results. Known limitations and unstable cases must be included; a higher aggregate score alone is not sufficient for adoption.
