# Release Publication Policy

- Derive the exact comparison range, commits, and changed paths from Git.
- Use pull-request descriptions and CI records as supporting context, never as replacements for Git evidence.
- Publish only customer-visible behavior under `## Customer-facing changes`.
- Give every published change its own `###` heading and `- Trace:` line containing a changed path or commit SHA from the requested range.
- State verification as passed only when the supplied evidence records a passing result and evidence ID.
- Identify every breaking contract change explicitly and explain the old contract, new contract, customer migration, and missing migration evidence.
- Exclude telemetry, refactors, tests, and build work that do not change customer behavior.
- If the requested range contains no publishable work, say so and provide the range and inspected Git evidence. Do not invent a customer-facing section.

This is the authoritative publication policy. The monolithic draft is a protected anti-pattern, not current guidance.
