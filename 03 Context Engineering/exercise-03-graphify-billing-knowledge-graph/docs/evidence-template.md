# Graph-First Billing Evidence

Record only the first attempt from each implementation session. Do not retry, correct, or rewrite either result. Use exact commits, commands, exit codes, counts, paths, and source citations.

## `evidence/before.md`

### Run

- Starting commit:
- Implementation commit:
- Agent:
- Model:
- Tools:
- Permissions:
- Time limit:
- Attempt: 1
- Human hints: 0
- Prompt: Correct recognized-revenue totals in the dashboard and scheduled snapshot. Use the current metric rules and billing-account boundaries, preserve gross-volume behaviour, and reject events without a valid account mapping.
- Context source: Normal repository search
- Graphify: Disabled
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:billing` | Pass or fail; exit code: N |
| Graph questions answered correctly | Number out of 6 |
| Files opened | Number |
| Wrong or stale sources used | Number |
| Unsupported assumptions | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/after.md`

Use the same Run fields, with `Context source: Graphify graph` and `Graphify: Enabled`.

### Results

| Proof | Result |
|---|---|
| `npm run test:billing` | Pass or fail; exit code: N |
| `npm run test:graph` | Pass or fail; exit code: N |
| `npm run agent:check` | Pass or fail; exit code: N |
| Graph questions answered correctly | Number out of 6 |
| Files opened | Number |
| Wrong or stale sources used | Number |
| Unsupported assumptions | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/graph-queries.md`

For GQ-01 through GQ-06, record the exact command, relevant result, confidence, answer, and source file used to verify inferred or ambiguous edges.

## `evidence/graph-audit.md`

### Current Sources Retained

| Rule or ownership fact | Source path and line | Graph node or edge |
|---|---|---|

### Stale or Unsupported Claims Excluded

| Claim | Source | Current evidence that rejects it |
|---|---|---|

### Graph-First Boundary

Record the first graph command and first source-file read. Confirm graph queries occurred first.

## `evidence/comparison.md`

Confirm fair run conditions, then compare question accuracy, files opened, stale sources, assumptions, billing test results, and changed files. State whether graph-first context improved the result and support it with both patches.

Use genuine Git diffs for `evidence/before.patch` and `evidence/after.patch`. Record the matching patch path in each run file and keep `evidence/comparison.md` in the final branch.
