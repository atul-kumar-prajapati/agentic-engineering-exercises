# Domain Modeling Product Rules Rescue Evidence

Copy the relevant section into each evidence file and replace every prompt with observed information. Do not report a command as passing unless its captured output proves it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Tools: [enabled tools]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.
- Attempt: 1
- Context source: [supplied repository or CONTEXT.md]
- Domain Modeling skill: [disabled or enabled]

### Investigation

Record which terms the agent distinguished, which sources it treated as authoritative, and which contradictions it noticed.

### Decisions and implementation

Record the rule the agent implemented, the files it changed, and any assumptions it made.

### Verification

Record every command, exit code, and relevant output.

## domain-audit.md

### Current rules retained

For every retained rule, provide the rule, its authoritative source path, and how it was represented in the domain vocabulary or decision record.

### Legacy or unsupported assumptions excluded

For every excluded assumption, provide the claim, where it appeared, and the current source that disproves it.

### Context boundary

List exactly what the final implementation agent received. Confirm that it did not receive the previous implementation or extra explanations.

## comparison.md

Compare vocabulary, source selection, authorization boundaries, implementation correctness, verification, and context size. Explain why the two implementation runs were fair.
