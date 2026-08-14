# Domain Modeling Evidence

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
- Prompt: Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.
- Context source: Supplied repository
- Domain Modeling skill: Disabled
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:rules` | Pass or fail; exit code: N |
| Domain terms kept distinct | Number |
| Current rules followed | Number |
| Legacy assumptions followed | Number |
| Authorization cases failed | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Important Problems

List no more than three. Give the implementation file and line, confused term or rule, and authoritative source.

## `evidence/after.md`

Use the same Run fields, with `Context source: CONTEXT.md` and `Domain Modeling skill: Enabled`.

### Results

| Proof | Result |
|---|---|
| `npm run test:rules` | Pass or fail; exit code: N |
| `npm run test:domain` | Pass or fail; exit code: N |
| `npm run agent:check` | Pass or fail; exit code: N |
| Domain terms kept distinct | Number |
| Current rules followed | Number |
| Legacy assumptions followed | Number |
| Authorization cases failed | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/domain-audit.md`

### Current Rules Retained

| Rule | Authoritative source and line | Domain term or ADR decision |
|---|---|---|

### Legacy or Unsupported Assumptions Excluded

| Assumption | Source | Current evidence that rejects it |
|---|---|---|

### Context Boundary

List exactly what the final agent received and confirm it did not receive the previous implementation or extra explanation.

## `evidence/comparison.md`

Confirm fair run conditions, then compare vocabulary, source selection, authorization cases, test results, context size, and changed files. State whether the domain model improved the result and support the conclusion with both patches.

Use genuine Git diffs for `evidence/before.patch` and `evidence/after.patch`. Record the matching patch path in each run file and keep `evidence/comparison.md` in the final branch.
