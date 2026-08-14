# Handoff Incident Evidence

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
- Prompt: Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.
- Context source: Raw session history
- Handoff skill: Disabled
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:incident` | Pass or fail; exit code: N |
| Current requirements followed | Number |
| Stale claims followed | Number |
| Protected behaviors broken | Number |
| Context supplied | Word or token count |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Important Problems

List no more than three. Give the implementation file and line, incorrect claim, and authoritative source that contradicts it.

## `evidence/after.md`

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
- Prompt: Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.
- Context source: `evidence/handoff.md`
- Handoff skill: Enabled
- Patch: `evidence/after.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:incident` | Pass or fail; exit code: N |
| `npm run test:handoff` | Pass or fail; exit code: N |
| `npm run agent:check` | Pass or fail; exit code: N |
| Current requirements followed | Number |
| Stale claims followed | Number |
| Protected behaviors broken | Number |
| Context supplied | Word or token count |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/handoff-audit.md`

### Verified Facts Retained

| Fact | Authoritative source and line | Verification |
|---|---|---|

### Outdated or Unsupported Claims Excluded

| Claim | Source | Contradicting evidence |
|---|---|---|

### Handoff Boundary

Confirm exactly what the final agent received and that the raw session history was not provided.

## `evidence/comparison.md`

### Fair Comparison

Confirm the same starting commit, incident request, agent, model, tools, permissions, time limit, human hints, and first-attempt condition.

### Results

Compare requirement selection, stale claims followed, protected behavior, test results, files changed, and context size.

### Conclusion

State whether the verified handoff improved the implementation. Support the answer with exact results and both patches.
