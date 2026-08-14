# Exercise 01 : Handoff Skill Incident Rescue

## Your Mission

Your team cannot finish a production incident because the previous agent session is long, contradictory, and incorrectly claims the fix is complete. Your mission is to create a compact, verified handoff that lets a fresh agent finish the work without repeating the same mistakes.

The raw session mixes current requirements with an outdated rollout proposal, failed assumptions, noisy output, and a partial implementation. Passing all of that context to another agent makes the problem worse.

Use the Handoff skill, then prove whether verified context improves the same agent's first-attempt result.

The duration for this challenge is 30 min or less.

## Project

[bugfix-context-app](./bugfix-context-app) is a work-queue application with a partial escalation fix and conflicting incident files.

Use this incident request in both implementation sessions:

> Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.

The request does not contain every rule. The challenge is to identify which repository sources are current before changing the implementation.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without the Handoff skill. Give it the incident request and raw session history. Do not provide hints, corrections, or retries. Commit the result and save `evidence/before.md` and `evidence/before.patch`.

3. Install the [Handoff skill](https://github.com/mattpocock/skills/blob/main/docs/productivity/handoff.md). In a preparation session, inspect the raw history, current policy, outdated proposal, partial implementation, source code, and tests. Separate verified facts from stale or unsupported claims.

4. Invoke the Handoff skill and save its output without rewriting it as `evidence/handoff.md`. Keep it within 1,200 words. Audit every retained or excluded claim in `evidence/handoff-audit.md` with its source path.

5. In the second branch, start another fresh implementation session. Give it only the incident request and `evidence/handoff.md`. It may inspect files named by the handoff, but it must not receive the raw session history or extra explanations.

6. Use the same agent, model, tools, permissions, time limit, and first-attempt condition as the first run. Do not provide hints, corrections, or retries. Keep the second implementation.

7. Save `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`. Raise the final PR only from the second branch.

## Evidence

Submit:

- The completed escalation fix and regression tests.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/handoff.md` and `evidence/handoff-audit.md`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` comparing requirement selection, context size, implementation, and verification.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, incident behavior, handoff size and contents, context boundaries, comparable sessions, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both implementation sessions use the same request and working conditions.
- The handoff identifies current requirements, completed work, remaining work, protected behavior, and verification commands without carrying stale guidance.
- The second agent receives no raw session history or extra human explanation.
- The final fix uses the current SLA boundary, preserves ownership and manual escalation, and keeps queue totals and saved state consistent.
- `npm run verify:exercise` passes and the final PR contains the handoff audit and all required proof.
