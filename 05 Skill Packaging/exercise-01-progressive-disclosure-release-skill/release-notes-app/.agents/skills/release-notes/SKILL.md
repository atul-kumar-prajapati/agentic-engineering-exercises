---
name: release-notes
description: Create customer-facing, evidence-backed release notes from a concrete Git comparison and supporting PR or CI evidence. Use when asked to draft, audit, or verify release notes or changelog entries for a commit, tag, or branch range. Do not use for generic commit summaries, internal engineering updates, incident reports, or change reviews without a publication request.
---

# Release Notes

Produce publication-ready notes whose claims are derived from Git, scoped to customer impact, and honest about verification.

## Required inputs

Obtain:

- the repository path;
- an explicit Git comparison such as `v1.4.0..v1.5.0`;
- any available PR descriptions, test results, migration checks, or rollout evidence.

Ask for a missing repository or comparison. Never infer a release range from the current branch.

## Workflow

1. Run the deterministic extractor:

   ```bash
   node .agents/skills/release-notes/scripts/extract-release.mjs \
     --repo <repository-path> \
     --range <base>..<head>
   ```

2. Treat the extractor output as the source of truth for commits, paths, and patches. Treat PR and CI material as supporting evidence, not a replacement for Git.
3. Read [references/release-policy.md](references/release-policy.md) before classifying or publishing changes.
4. Classify each candidate as customer-facing, breaking, or internal-only. Omit internal-only work unless it changes a customer contract.
5. Match verification evidence to each published claim. Label absent or incomplete verification as `Missing evidence`; never assume a check passed.
6. Draft the notes using the reference's required structure. Include a real changed path or commit SHA in every `- Trace:` line.
7. Recheck every published claim against the extractor output and every verification statement against supplied evidence.

## Guardrails

- Do not publish a change solely because its commit subject sounds important.
- Do not expose internal implementation details as customer benefits.
- Do not bury a breaking change among ordinary fixes.
- Do not invent tests, results, screenshots, rollout steps, or migration success.
- Do not copy example wording as a release claim; derive claims from the supplied range.

## Verify an existing draft

Apply the same workflow to audit existing notes. Report untraced claims, omitted customer impact, hidden breaking changes, internal-only entries, and unsupported verification claims before proposing corrected notes.
