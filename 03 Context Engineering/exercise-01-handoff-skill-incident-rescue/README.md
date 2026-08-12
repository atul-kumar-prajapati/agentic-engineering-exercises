# Exercise 01 : Handoff Skill Incident Rescue

## Your Mission

Your mission is to rescue a production bug from a long and unreliable agent session.

You are given a partially implemented fix and a previous agent session containing current requirements, outdated guidance, failed assumptions, noisy test output, and an incorrect completion claim.

Use the Handoff skill to create a compact, verified handoff that allows a fresh coding agent to complete the fix without repeating the previous mistakes.

You must prove the improvement by comparing the agent's behaviour before and after using the handoff.

The duration for this challenge is 30 min or less.

## Project

[bugfix-context-app](./bugfix-context-app) contains the application code and incident files for this exercise.

Use the following incident request for both runs:

> Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.

The correct implementation is not fully described in the request. You must identify the authoritative information from the conflicting incident files.

## How To Go About It

Choose a coding agent supported by the [Handoff skill](https://www.skills.sh/mattpocock/skills/handoff).

Install the skill using:

```bash
npx skills add https://github.com/mattpocock/skills --skill handoff
```

First, start a fresh agent session without using the Handoff skill. Give the agent the incident request and the supplied raw session history. Record how it identifies requirements, handles conflicting information, and completes the fix. Save the implementation as evidence, then revert it.

Next, start a new preparation session. Ask the agent to inspect the raw session history, current requirements, source code, tests, and partial implementation. It must separate verified facts from outdated instructions, assumptions, and unsupported completion claims.

Invoke the Handoff skill with the next session focused on completing and verifying the incident fix. Copy the generated handoff without manually rewriting it to `evidence/handoff.md`. Keep the handoff at 1,200 words or fewer. If the handoff is incorrect, improve the preparation session and generate it again.

Start another fresh agent session and provide only the incident request and generated handoff. The agent may inspect files referenced by the handoff, but it must not receive the raw session history or additional explanations.

Use the same agent, model, tools, permissions, and implementation time limit for both runs. Do not rerun an implementation session to obtain a preferred result.

## Evidence

Submit:

- The completed automatic escalation fix and regression tests.
- `evidence/before.md` describing the agent's behaviour without the handoff.
- `evidence/before.patch` containing the first implementation.
- `evidence/handoff.md` containing the Handoff skill output.
- `evidence/handoff-audit.md` listing the verified facts retained and the outdated or unsupported claims excluded.
- `evidence/after.md` describing the fresh agent's behaviour with the handoff.
- `evidence/after.patch` containing the final implementation.
- `evidence/comparison.md` explaining what improved and how the handoff influenced the final result.
- Output from `npm run test:incident`, `npm run test:handoff`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the supplied incident files and [evidence template](./docs/evidence-template.md). Follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that the Handoff skill was genuinely used, both implementation runs used fair conditions, and the fresh agent received only the generated handoff.

The handoff must clearly identify authoritative requirements, completed work, remaining work, protected behaviour, and verification commands without carrying outdated assumptions or unnecessary session noise.

The final implementation must follow the current SLA boundary, preserve ownership and manual escalations, keep queue totals and saved state consistent, and pass the required regression tests.

The exercise is incomplete if the handoff was manually recreated, the raw session history was given to the final agent, unsupported claims were treated as facts, or the required checks do not pass.

See the [Handoff Skill Incident Rescue evaluation rubric](../../docs/EVALUATION_RUBRICS.md#handoff-skill-incident-rescue).
