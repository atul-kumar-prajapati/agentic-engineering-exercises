# Exercise 02 : Domain Modeling Product Rules Rescue

## Your Mission

Your team shipped an authorization bug because product documents and code use the words account, customer, workspace, owner, and admin inconsistently. Your mission is to create a clear domain model and use it to implement the correct AI-history export rule.

The current implementation treats billing ownership as workspace access. Conflicting current and legacy sources make a plausible but unsafe fix easy to produce.

Use the Domain Modeling skill, then prove whether precise vocabulary improves the same agent's first-attempt result.

The duration for this challenge is 30 min or less.

## Project

[product-rules-app](./product-rules-app) is a workspace settings application with conflicting access rules and a seeded policy defect.

Use this production change in both implementation sessions:

> Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.

The request does not define `authorized administrator` or `eligible workspace`. Their correct meaning must be discovered from current repository evidence.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without the Domain Modeling skill. Give it the production change exactly as written. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Install the [Domain Modeling skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md). Inspect the first result, current policy, legacy notes, support example, previous-agent claim, source code, and tests.

4. In the second branch, create `CONTEXT.md` with the canonical terms and relationships, limited to 700 words. Create `docs/adr/0001-ai-history-export.md` with the resolved policy, its sources, rejected interpretations, and consequences.

5. Start another fresh agent session. Give it only the production change and `CONTEXT.md`; it may inspect files referenced by that document. Use the same agent, model, tools, permissions, time limit, and first-attempt condition as the first run.

6. Do not provide hints, corrections, or retries. Keep the implementation and regression tests from the second session.

7. Save `evidence/after.md`, `evidence/after.patch`, `evidence/domain-audit.md`, and `evidence/comparison.md`. Raise the final PR only from the second branch.

## Evidence

Submit:

- The completed export policy and regression tests.
- `CONTEXT.md` and `docs/adr/0001-ai-history-export.md`.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/domain-audit.md` and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, export behavior, domain vocabulary, source decisions, comparable sessions, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both implementation sessions use the same request and working conditions.
- The domain model clearly separates billing customer, user, workspace, membership, role, and data residency.
- Current rules are retained and legacy or unsupported interpretations are explicitly excluded.
- Export requires an Enterprise workspace with standard residency and an active admin membership for the requesting user in that workspace.
- Billing ownership alone does not grant access, `npm run verify:exercise` passes, and all required proof is present.
