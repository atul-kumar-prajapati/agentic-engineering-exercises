# Release publication policy

## Publication boundary

Derive candidates from the supplied Git comparison. Publish only behavior, interfaces, configuration, or operational requirements that customers can observe or must act on.

Exclude refactors, telemetry renames, test-only changes, formatting, build cleanup, and other internal work when the customer contract is unchanged. A PR description may clarify intent, but it cannot make a claim publishable when the Git range does not support it.

## Classification

- **Customer-facing:** changes user-visible behavior, a public interface, output, supported configuration, or required customer action.
- **Breaking:** removes or renames a public field or capability, changes a contract incompatibly, or requires customer migration or coordinated rollout.
- **Internal-only:** changes implementation or observability without changing the customer contract.

Place breaking work first and describe both the compatibility impact and the required migration or rollout action. Do not soften a breaking change into an ordinary improvement.

## Evidence rules

Separate implementation trace from verification evidence:

- A trace proves where the change exists. Use a changed path or commit SHA from the extractor.
- Verification evidence proves a relevant check ran and passed. Cite the supplied evidence identifier or result.
- `Missing evidence` means a relevant check, screenshot, dry run, or other proof was absent. State exactly what is missing.

Do not turn missing, expected, implied, or unrelated evidence into a pass. A passing unit test does not substitute for a missing migration dry run or another materially different check.

## Required output

Use this structure:

```markdown
# Release notes

## Customer-facing changes

### <clear customer outcome or breaking-change title>

<Concise description of the observable behavior and, when breaking, migration impact.>

- Trace: `<changed/path>` or `<commit SHA>`
- Verification: <supplied result and evidence ID, or `Missing evidence: <what is absent>`>

## Verification gaps

- <Only unresolved evidence gaps; omit this section when none exist.>
```

Every `###` entry under `## Customer-facing changes` must include a `- Trace:` line. Prefer the narrowest changed path that supports the claim; use a commit SHA when the claim spans paths. Include verification gaps close to the affected item and summarize unresolved gaps in the final section.
