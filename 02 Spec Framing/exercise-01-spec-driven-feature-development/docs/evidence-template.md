# Spec Framing Evidence

Record only the first attempt from each agent session. Do not retry, correct, or rewrite the generated specification. Use exact commits, commands, exit codes, counts, and identifiers instead of long explanations.

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
- Prompt: Allow users to manage their subscriptions.
- Human hints: 0
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| Specification artifacts created | File paths |
| Invented decisions | Number |
| Important questions missed | Number |
| Requirements without testable acceptance criteria | Number |
| Requirements not traced to tasks | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Important Problems

List no more than three. Cite the generated file and line, then name the missing evidence or unanswered question.

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
- Prompt: Allow users to manage their subscriptions.
- Human hints: 0
- Clarification file used: `specs/clarifications.md`
- Patch: `evidence/after.patch`

### Results

| Proof | Result |
|---|---|
| `npm run spec:verify` | Pass or fail; exit code: N |
| Confirmed questions | Q identifiers |
| Explicit assumptions | Q identifiers |
| Requirements | Number and REQ identifiers |
| Acceptance criteria | Number and AC identifiers |
| Untraced requirements or criteria | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Decisions Resolved

| Clarification | Repository evidence | Final requirement |
|---|---|---|
| Q identifier | File and line | REQ identifier |

## `evidence/comparison.md`

### Fair Comparison

| Condition | Before | After | Same? |
|---|---|---|---|
| Starting commit | | | Yes or No |
| Product request | | | Yes or No |
| Agent and model | | | Yes or No |
| Tools and permissions | | | Yes or No |
| Time limit | | | Yes or No |
| Human hints | | | Yes or No |
| Attempts | | | Yes or No |

### Results

| Metric | Before | After |
|---|---|---|
| Invented decisions | | |
| Missed questions | | |
| Testable acceptance criteria | | |
| Traceability gaps | | |
| Validation result | | |

### Improvements

Identify at least three specific improvements. For each one, cite its Q identifier, final REQ identifier, and the affected generated file.

### Conclusion

State whether clarification made the specification safer to implement. Support the answer with the tables and patches.
