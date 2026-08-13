# Exercise 01 : Handoff Skill Incident Rescue

## Your Mission

Your mission is to complete a production bug fix from a long and unreliable agent session.

The previous session contains current requirements, outdated guidance, failed assumptions, noisy output, and an incorrect completion claim.

Use the Handoff skill to create a compact, verified handoff that helps a fresh agent complete the fix without repeating those mistakes.

Compare the agent's implementation before and after using the handoff.

The duration for this challenge is 30 min or less.

## Project

[bugfix-context-app](./bugfix-context-app) contains the application code, partial implementation, and conflicting incident files.

Use this request for both agent runs:

> Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.

The request does not contain every implementation rule. Identify the authoritative information from the supplied incident files.

## How To Go About It

Install the [Handoff skill](https://github.com/mattpocock/skills/blob/main/docs/productivity/handoff.md):

```bash
npx skills add mattpocock/skills --skill=handoff
```

Start a fresh agent session without using the skill. Provide the incident request and raw session history, save the first implementation and observations, then revert the implementation.

Start a preparation session and inspect the raw history, current requirements, partial implementation, source code, and tests. Separate verified facts from outdated instructions, assumptions, and unsupported claims.

Invoke the Handoff skill for a fresh agent that will complete and verify the fix. Copy the generated output without rewriting it to `evidence/handoff.md`. Keep it within 1,200 words.

If the handoff is incorrect, improve the preparation session and generate it again before starting the final implementation session.

Start another fresh agent session. Provide only the incident request and `evidence/handoff.md`. The agent may inspect files referenced by the handoff but must not receive the raw session history or additional explanations.

Use the same agent, model, tools, permissions, prompt, time limit, and first attempt for both implementation runs. Do not rerun either implementation.

## Evidence

Submit:

- The completed escalation fix and regression tests.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/handoff.md` containing the unmodified Handoff skill output.
- `evidence/handoff-audit.md` showing verified facts retained and outdated claims excluded.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` explaining what improved.
- Output from `npm run test:incident`, `npm run test:handoff`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [evidence template](./docs/evidence-template.md) and follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The handoff must identify the authoritative requirements, completed work, remaining work, protected behaviour, and verification commands without carrying outdated guidance.

The final implementation must use the current SLA boundary, preserve ownership and manual escalations, and keep queue totals and saved state consistent.

The exercise is incomplete if the runs are not comparable, the handoff is manually rewritten, the final agent receives the raw session history, protected inputs are changed, or the required checks fail.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#handoff-skill-incident-rescue).
