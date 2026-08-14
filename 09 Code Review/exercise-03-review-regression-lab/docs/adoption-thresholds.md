# Review Prompt Adoption Thresholds

Use one real remote provider, model, temperature, and configuration for baseline and candidate. Run three uncached samples for every prompt/case pair, producing 18 responses.

- Historical five-bug recall: at least 80% across candidate samples.
- Multi-bug recall: at least 80% across candidate samples.
- Clean-control precision: at least 90%; all three candidate samples must avoid a false blocker.
- Regression limit: no candidate metric may be more than five percentage points below baseline.

Human-label every response against the protected finding catalog and bind the judgment to its SHA-256. Any failed threshold means do not adopt, regardless of aggregate score.
