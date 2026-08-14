# Exercise 02 : Repeated Mistake to Repository Rule

## Your Mission

Your team repeatedly corrects the same coding-agent persistence mistakes in PR review. Your mission is to turn those repeated corrections into minimal repository guidance and prove it changes a fresh agent's first attempt.

Three mistakes recur across separate changes: display labels stored as identity, unnormalized status values, and ambient timestamps inside business logic. The proving task does not reveal these hidden conventions.

Compare the exact task before and after guidance, then keep only rules supported by repeated evidence.

The duration for this challenge is 45 min or less.

## Project

[rule-hardening-app](./rule-hardening-app) contains the defective persistence boundary and protected patch grader. The [correction history](./docs/correction-history.json), [guidance contract](./docs/guidance-contract.md), and [proving task](./tasks/proving-change.md) are immutable.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, run the proving task in a fresh agent session without new guidance. Do not hint, correct, retry, or edit the patch. Save `evidence/before.md` and `evidence/before.patch`.

2. Map each proposed rule to at least two separate correction events. Do not create permanent guidance from one mistake or personal preference.

3. In the second branch, create a short `AGENTS.md` that routes persistence work to `.agent/persistence.md`. Keep stable-ID, canonical-status, injected-clock, and exception details only in the deeper file.

4. Commit the guidance without implementation code. Start a different fresh session from that commit using the same prompt, agent, model, tools, permissions, and time limit.

5. Preserve the unedited first patch in `evidence/after.patch`. The patch grader must show at least two baseline defects and zero final defects.

6. Apply the successful after patch with one participant test in a separate implementation commit. Final source must be identical to the graded patch.

7. Save `evidence/after.md`, comparison, rule map, history, and command output. Raise a focused PR from the second branch.

## Evidence

Submit:

- `AGENTS.md`, `.agent/persistence.md`, final implementation, and participant test.
- `evidence/before.md`, unedited `evidence/before.patch`, `evidence/after.md`, and unedited `evidence/after.patch`.
- Run metadata, `evidence/comparison.md`, `rule-map.md`, `history.json`, and command output.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, rule support, concise guidance, patch authenticity, matched sessions, objective grading, source identity, history, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both sessions differ only by repository guidance and use unedited first-attempt patches.
- Every permanent rule is supported by repeated correction events.
- `AGENTS.md` remains concise and routes to non-duplicated focused guidance.
- The grader finds at least two before defects and zero after defects, and final source equals the graded after patch.
- `npm run verify:exercise` passes and Git history separates guidance from implementation.
