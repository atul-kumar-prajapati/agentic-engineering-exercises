# Before: first attempt without Domain Modeling

- Agent: Codex
- Model: GPT-5
- Tools: PowerShell, apply_patch
- Permissions: workspace read/write; escalation available when required
- Time limit: 30 minutes
- Prompt: Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.
- Attempt: 1
- Domain Modeling skill: disabled
- Date: 2026-08-12

## Interpretation and behavior

The fresh agent inspected the uncurated repository and interpreted an eligible workspace as Enterprise with standard residency. It required an active admin membership belonging to the same workspace and explicitly treated billing-customer ownership as non-authorizing. Its first attempt also added a workspace-settings UI wired to the policy.

The attempt's exact policy implementation was captured in `evidence/before.patch`; the broader UI files it touched are recorded in `evidence/comparison.md`. The run was not rerun or reconstructed.

## Commands and results

- `npm.cmd run test:rules` — PASS, 6/6 product-rule checks.
- `npm.cmd run test:submission` — FAIL as expected at this stage because the curated context, decision record, and complete evidence set did not yet exist.
- `npm.cmd run agent:check` — PASS, including protected-input integrity, lint, agent contract, formatting, typecheck, and build.

These results show that the baseline behavior happened to satisfy the protected rule tests, while the submission remained incomplete without the shared vocabulary and decision record.
