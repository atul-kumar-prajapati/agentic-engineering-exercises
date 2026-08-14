# Protected Regression Catalog

The historical diff contains five observable regressions across search, status filtering, risk scoring, summary metrics, and queue completeness. The security diff contains independent cache-parse and authorization failures. The clean control replaces `slice().sort()` with an equivalent spread-copy sort.

These outcomes belong in the evaluator and human judgment process, not in the candidate prompt. A prompt that names these cases, finding IDs, exact APIs, or diff tokens has memorized the benchmark and is rejected.
