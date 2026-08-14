# Exercise 03 : Incident-Backed Payment Visualization

## Your Mission

Your team cannot review a payment feature because its legacy brief disagrees with runtime behavior and hides a duplicate-capture defect. Your mission is to repair the reconciliation boundary and create four diagrams that accurately explain the corrected system.

The webhook reconciler records duplicate capture events and accepts unknown gateway references. The legacy brief also describes behavior that does not exist in code.

Compare a brief-led visualization with a source-and-incident-led result, then prove every important relationship from exact source lines.

The duration for this challenge is 45 min or less.

## Project

[payment-workflow-app](./payment-workflow-app) contains checkout, payment, ledger, receipt, and webhook code. The protected [incident](./docs/duplicate-webhook-incident.md) defines the required repair; the [legacy brief](./docs/payment-feature-brief.md) contains claims that must be verified.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the diagrams or implementation produced in the first branch.

2. In the first branch, start a fresh agent session with the legacy brief and visualization request. Do not provide hints, corrections, or retries. Save the result, `evidence/before.md`, and `evidence/before.patch`.

3. Review the first result, incident, and [diagram contract](./docs/diagram-contract.md). Trace approved checkout, declined authorization, first webhook delivery, duplicate delivery, invalid signature, and unknown gateway reference.

4. In the second branch, start a fresh session using the same agent, model, tools, permissions, time limit, and first-attempt condition. Give it the incident and observed traces instead of unsupported brief claims.

5. Preserve signature validation, reject unknown gateway references, and make repeated event IDs idempotent without hiding valid first-delivery behavior.

6. Create Mermaid architecture, reconciliation-state, sequence, and data diagrams. Map VIS-01 through VIS-16 to exact source lines and record every brief contradiction.

7. Commit the fix and diagrams, use that commit as the evidence source SHA, save the after and comparison evidence, and raise the PR from the second branch.

## Evidence

Submit:

- The four required Mermaid diagrams and webhook fix.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/traceability.json`, `evidence/brief-contradictions.md`, `evidence/diagram-manifest.json`, and `evidence/verification.md`.
- Captured payment trace and parser output under `evidence/commands/`.
- `evidence/comparison.md` with unsupported claims, defect coverage, and final traceability.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, payment and webhook behavior, Mermaid syntax, exact source relationships, evidence hashes, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both sessions use matching conditions and genuine first-attempt artifacts.
- Duplicate capture is idempotent, unknown references are rejected, and signature validation remains enforced.
- All four diagrams parse and accurately show implemented architecture, states, paths, and data relationships.
- VIS-01 through VIS-16 map to exact source lines and unsupported legacy claims are recorded.
- `npm run verify:exercise` passes and the final source SHA, diagrams, hashes, and evidence agree.
