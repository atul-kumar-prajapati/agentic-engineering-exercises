# Release Publication Policy

- Derive candidate changes from the supplied Git comparison.
- Publish only customer-visible behavior.
- Put publishable entries under `## Customer-facing changes`.
- Give each `###` entry a `- Trace:` line containing a changed path or commit SHA.
- Identify breaking changes explicitly and include rollout or migration impact.
- Identify missing verification evidence explicitly. Never convert missing evidence into a pass.
- Exclude internal telemetry and refactors with no customer contract change.
