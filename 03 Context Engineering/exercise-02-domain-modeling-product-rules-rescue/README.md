# Exercise 02 : Domain Modeling Skill Product Rules Rescue

## Your Mission

Your mission is to stop a coding agent from implementing product rules with the repository's confused domain language.

You are given a working application where `account`, `customer`, `workspace`, `owner`, and `admin` are used as if they mean the same thing. A previous implementation follows that mistake and grants AI-history export to the wrong users.

Use the Domain Modeling skill to create a small shared vocabulary and one decision record, then implement the export rule with the correct concepts.

Prove the improvement by comparing the agent's first attempt without the skill and a fresh attempt using the curated domain context.

The duration for this challenge is 30 min or less.

## Project

[product-rules-app](./product-rules-app) contains the application, conflicting rule documents, and incorrect export policy.

Use the request in [product request](./docs/product-request.md) for both agent runs. The authoritative rules must be identified from the supplied sources instead of invented from the request.

## How To Go About It

Install the [Domain Modeling skill](https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling):

```bash
npx skills add https://github.com/mattpocock/skills --skill domain-modeling
```

First, give a fresh agent the product request and the repository without invoking the skill. Save its first implementation and behaviour, then revert the implementation.

Next, use the skill to resolve overloaded terms and code contradictions. Create `CONTEXT.md` as a compact glossary and `docs/decisions/001-ai-history-export.md` for the policy decision.

Start another fresh agent with the same request and agent conditions. Give it only the curated context and files referenced there. Do not rerun either implementation session.

## Evidence

Submit the completed policy and tests, `CONTEXT.md`, the decision record, `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`.

Run `npm run test:rules`, `npm run test:submission`, and `npm run agent:check` from `product-rules-app`. Record the commands and results in the evidence files.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that the vocabulary separates billing customers, workspaces, memberships, and roles; the decision record resolves the conflicting rule sources; and the final code uses those concepts consistently.

The final rule must enforce plan, membership, role, and data-residency boundaries. The comparison must use the same agent, model, tools, permissions, prompt, time limit, and first attempt.

The exercise is incomplete if terms remain ambiguous, the first run is recreated, the final agent receives extra explanations, protected inputs are changed, or required checks fail.

See the [Domain Modeling Product Rules Rescue rubric](../../docs/EVALUATION_RUBRICS.md#domain-modeling-product-rules-rescue).
