# Before/after comparison

Both runs were independent first attempts using Codex with GPT-5, PowerShell and `apply_patch`, the same workspace permissions, a 30-minute limit, and the exact product-request prompt. Neither run was rerun. The controlled difference was the context: the baseline received the uncurated repository without the Domain Modeling skill; the second run received the installed skill, `CONTEXT.md`, the decision record, and only the source documents referenced there.

| Dimension | Before: skill disabled | After: skill enabled |
| --- | --- | --- |
| Vocabulary | The agent inferred the rule directly from conflicting repository language and reported the correct concepts, but left no shared vocabulary for future work. | The agent consumed canonical distinctions among billing customer, workspace, membership, role, admin, and billing owner. |
| Source authority | Authority was implicit in the agent's repository inspection. | The accepted decision explicitly selects the approved 2026 policy, uses the support example as corroboration, and rejects the superseded 2025 draft. |
| Requirements found | Enterprise, standard residency, active same-workspace admin membership, no billing-owner grant. | The same four required boundaries, each expressed as an independent condition, plus explicit denial when membership is absent. |
| Incorrect assumptions | No protected-rule error occurred in this particular first attempt; relying on one agent's inference still left the repository's overloaded language unresolved. | No account/customer/owner equivalence is used; workspace eligibility and caller authorization remain separate. |
| Files touched by agent | Policy, a new settings component, `App.tsx`, and styles. The UI embedded one allowed sample identity. | Policy only. It avoided unrelated presentation changes and hard-coded authorization examples. |
| Behavior checks | 6/6 protected product-rule cases passed. | 6/6 protected product-rule cases passed; the function also denies `null` or `undefined` membership. |
| Context supplied | Exact request plus uncurated repository. | Exact request plus curated glossary, decision, referenced sources, and necessary code/tests only. |
| First-attempt duration | Approximately 8 minutes. | Approximately 3 minutes. |

## Improvement demonstrated

The improvement is not a fabricated before-test failure: the genuine baseline happened to pass all six protected cases. The curated run improved repeatability and scope. It made the authoritative source and ubiquitous language durable, completed in less than half the reported time, changed one policy file instead of four UI/policy files, avoided a hard-coded allowed-user example, and represented “no membership” as a denial rather than requiring callers to manufacture a membership value.

## Required final verification

Run on 2026-08-12 from `product-rules-app` after all deliverables were created:

- `npm.cmd run test:rules` — PASS, 6/6 product-rule checks.
- `npm.cmd run test:submission` — PASS, evidence complete and comparable.
- `npm.cmd run agent:check` — PASS, including 7 protected inputs, lint, agent contract, formatting, typecheck, and production build.
