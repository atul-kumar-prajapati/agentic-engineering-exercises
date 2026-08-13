# Exercise 02 : Domain Modeling Skill Product Rules Rescue

## Your Mission

Your mission is to fix an AI-history export rule that was implemented using confused domain language.

The application treats `account`, `customer`, `workspace`, `owner`, and `admin` as interchangeable terms. This causes billing ownership to be incorrectly treated as workspace access.

Use the Domain Modeling skill to define the correct vocabulary, resolve the conflicting rules, and implement the correct export policy.

Compare the agent's implementation before and after providing the domain model.

The duration for this challenge is 30 min or less.

## Project

[product-rules-app](./product-rules-app) contains the application code, conflicting rule documents, and seeded policy defect.

Use this request for both agent runs:

> Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.

The request does not define `authorized administrator` or `eligible workspace`. Identify their correct meaning from the repository sources.

## How To Go About It

Install the [Domain Modeling skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md):

```bash
npx skills add mattpocock/skills --skill=domain-modeling
```

Start a fresh agent session without using the skill. Provide the product request and repository, save the first implementation and observations, then revert the implementation.

Use the Domain Modeling skill to inspect the current policy, legacy notes, support example, previous-agent claim, source code, and tests.

Create:

- `CONTEXT.md` containing the canonical terms and relationships. Keep it within 700 words.
- `docs/adr/0001-ai-history-export.md` containing the resolved export policy, sources, and consequences.

Start another fresh agent session. Provide only the product request and `CONTEXT.md`. The agent may inspect files referenced by `CONTEXT.md`.

Use the same agent, model, tools, permissions, prompt, time limit, and first attempt for both runs. Do not rerun either implementation.

## Evidence

Submit:

- The completed export policy and regression tests.
- `CONTEXT.md` and `docs/adr/0001-ai-history-export.md`.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/domain-audit.md` showing current rules retained and legacy rules excluded.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` explaining what improved.
- Output from `npm run test:rules`, `npm run test:domain`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [evidence template](./docs/evidence-template.md) and follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The domain model must clearly separate billing customer, user, workspace, membership, role, and data residency.

The final policy must require an Enterprise workspace with standard residency and an active admin membership belonging to the requesting user in that same workspace. Billing ownership alone must not grant access.

The exercise is incomplete if the runs are not comparable, legacy guidance is treated as current, protected inputs are changed, or the required checks fail.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#domain-modeling-product-rules-rescue).
