# Exercise 01 : Agent Onboarding Kit

## Your Mission

Your team is struggling with incorrect and inconsistent PRs from coding agents. Your mission is to create clear repository onboarding instructions that help a fresh agent make correct and tested changes.

The application has limited documentation, mixed patterns, and important rules that are not clearly explained. Agents may change the wrong code, repeat existing mistakes, include unrelated work, or finish without running the right checks.

Build reusable onboarding, then prove that it improves an agent's work without giving the agent extra help.

The duration for this challenge is 30 min or less.

## Project

[agent-onboarding-app](./agent-onboarding-app) is a support case-routing application maintained by several teams. Its architecture, coding rules, and verification process are not clearly documented, which causes coding agents to produce inconsistent PRs.

The support team needs the following production change. It will be assigned first in a fresh agent session without onboarding, then in another fresh session with your onboarding. Compare the results to prove whether the onboarding works:

> Add a Needs Attention filter that shows cases that have waited too long or have high customer revenue risk. Use the existing business rules and keep the filter count, displayed results, and sorting consistent.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without `AGENTS.md` or other onboarding files. Give the agent the production change exactly as written. Do not provide hints, corrections, or retries. Commit the agent's implementation and save the session details in `evidence/before.md` and its code changes in `evidence/before.patch`.

3. Review the repository and the first implementation. Identify what the agent misunderstood or missed. Discover the project structure, correct coding patterns, unsafe existing patterns, development workflow, required tests, and completion checks.

4. Switch to the second branch and create:

   - `agent-onboarding-app/AGENTS.md`
   - Any supporting documents you consider necessary under `agent-onboarding-app/.agent/`.

   Keep `AGENTS.md` concise and link it to every supporting document. Explain how an agent should work in the repository, but do not include the solution to the Needs Attention feature.

5. Start another fresh agent session in the second branch with the onboarding files available. Give it the same production change. Use the same agent, model, tools, permissions, and time limit as the first run. Do not provide hints, corrections, or retries.

6. Keep the second implementation. Save its session details in `evidence/after.md`, its code changes in `evidence/after.patch`, and explain the differences between both runs in `evidence/comparison.md`.

7. Add all before and after evidence to the second branch. Raise the final PR from this branch and keep the first branch available until the review is complete.

A reviewer may later give a different repository change to another fresh agent. Your onboarding must work without being rewritten for the new task.

## Evidence

Submit:

- `AGENTS.md` and any supporting documents you created.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` explaining the first run's problems, what improved, and which onboarding instructions caused the improvement.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. This is the final pass-or-fail check for the challenge. It confirms that the application still builds, the Needs Attention feature works, the onboarding is present, and the before-and-after evidence is complete.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit.
- Both agent sessions use the same production change, agent, model, tools, permissions, and time limit.
- `AGENTS.md` contains clear, repository-specific guidance without including the sample feature's solution.
- The second agent completes the Needs Attention feature without hints, corrections, or retries.
- `npm run verify:exercise` passes.
- The second branch contains all required before-and-after evidence.
- The final PR contains only the onboarding, final feature implementation, and required evidence.
