# Billing Incident Questions

Answer these questions before both implementation runs.

1. `GQ-01`: Which function owns the recognized-revenue formula, and where is a tenant resolved to a billing account?
2. `GQ-02`: What path connects the dashboard to the recognized-revenue calculation?
3. `GQ-03`: What path connects the scheduled snapshot to the same calculation?
4. `GQ-04`: Which source defines credits, refunds, grouping, and missing-mapping behaviour? Which source is stale?
5. `GQ-05`: Which team owns the calculation, and which team only consumes its output?
6. `GQ-06`: Which unrelated metric must remain unchanged?

For the graph-first run, record the exact `graphify query`, `graphify path`, or `graphify explain` command used for every answer. Record the relevant output and confidence. Verify important `INFERRED` or `AMBIGUOUS` edges in source before using them.
