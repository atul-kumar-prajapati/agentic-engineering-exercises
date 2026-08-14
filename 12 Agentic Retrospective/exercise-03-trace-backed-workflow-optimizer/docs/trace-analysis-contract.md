# Trace Analysis Contract

Create one cluster for each repeated `rootCause` in `failure-traces.json`. A workflow change is justified only when at least two trace IDs support the cluster.

For each cluster record its exact trace IDs, frequency, observable failure, root cause, smallest general workflow change, and the protected replay assertions that measure it. Do not copy case-specific answers into the workflow.

The five expected causes are scope before action, evidence authority, completion verification, context selection, and clarification boundary. The trace record justifies what to improve; the held-out benchmark decides whether to adopt it.
