# Graphify Billing Knowledge Graph Evidence

Copy the relevant section into each evidence file and replace every prompt with observed information. Do not report a command as passing unless its captured output proves it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Tools: [enabled tools]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Correct recognized-revenue totals in the dashboard and scheduled snapshot. Use the current metric rules and billing-account boundaries, preserve gross-volume behaviour, and reject events without a valid account mapping.
- Attempt: 1
- Context source: [normal repository search or Graphify graph]
- Graphify: [disabled or enabled]

### Questions and investigation

Record answers to `GQ-01` through `GQ-06`, files opened in order, and assumptions made.

### Implementation

Record the files changed and why.

### Verification

Record every command, exit code, and relevant output.

## graph-queries.md

For every graph question, record the exact command, relevant output, confidence, answer, and source files opened to verify important inferred or ambiguous edges.

## graph-audit.md

### Current sources retained

List each current rule or ownership fact, its source path, and the graph node or edge that led to it.

### Stale or unsupported claims excluded

List each excluded claim, where it appeared, and the source that disproves it.

### Graph-first boundary

Confirm that the graph-first agent queried the graph before opening source files.

## comparison.md

Compare question accuracy, files opened, wrong files opened, unsupported assumptions, implementation correctness, and verification. Explain why both first attempts used fair conditions.
