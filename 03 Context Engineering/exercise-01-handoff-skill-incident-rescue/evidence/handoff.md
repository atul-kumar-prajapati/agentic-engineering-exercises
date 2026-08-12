# Handoff: complete and verify INC-2047

## Objective

Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep queue totals and saved workflow state consistent. Work in `bugfix-context-app` and keep public workflow API names compatible.

## Authoritative requirements

- `incidents/INC-2047.md` defines the incident scope: automatic escalation policy and workflow API integration only; manual actions, filtering, risk scoring, and public API names are protected.
- `docs/current-sla-policy.md` is the approved production authority (v3.1, effective 2026-07-01). Eligibility requires `High` priority, `waitingHours >= 48`, not already escalated, and not manually escalated. An eligible item changes only `status` to `Escalated` and `escalationMode` to `automatic`; preserve owner and every other field. Existing manual escalations must remain unchanged; reruns must be idempotent.
- `docs/workflow-api-contract.md` requires `runAutomaticEscalation()` to save the resulting queue and return a copy. Later `fetchWorkItems()` calls and dashboard totals must use that saved state. Keep `fetchWorkItems`, `saveAction`, `runAutomaticEscalation`, and `collectEvidence` names and cloning behavior.
- `scripts/run-incident-tests.mjs` is the executable behavior specification. It expects exactly `INC-2047-A` and `INC-2047-E` to become automatic, the existing manual `INC-2047-D` to remain intact, and three escalated/blocked items in saved state.

## Current starter work

- `src/services/escalationPolicy.ts` already provides predicate, single-item, and array-level automatic escalation functions, but the partial implementation follows the superseded pilot: threshold 24 and owner replacement with `Incident Desk`.
- `src/services/workflowApi.ts` already wires the policy into `runAutomaticEscalation()` and returns cloned results, but stores them only in a local `updatedItems` variable; `storedItems` is not updated.
- `src/App.tsx` already uses the returned queue for dashboard state. `src/services/workflowApi.ts` already preserves manual/automatic mode semantics in `saveAction()` and protects internal state with cloning. Do not redesign these working paths.
- Live baseline: `npm.cmd run test:incident` reports 6 passed, 4 failed. Failures are the 47-hour boundary, owner preservation, persisted eligible IDs, and saved-state totals. The repository files show only line-ending working-tree differences (`git diff --ignore-space-at-eol` is empty), so preserve unrelated changes.

## Remaining implementation

1. In `src/services/escalationPolicy.ts`, use the 48-hour threshold and remove the automatic owner override. Preserve object identity for ineligible/already escalated items as the current functions do.
2. In `src/services/workflowApi.ts`, assign the policy result back to module-level `storedItems` before returning cloned items.
3. Make no scoring, filter, UI, seed-data, manual-action, evidence, public-export, or protected requirement-file changes.

## Protected behavior and pitfalls

- Do not use `docs/sla-rollout-proposal.md` or `docs/abandoned-fix.patch` as current guidance; they describe the rejected 24-hour/Incident Desk pilot.
- Do not trust `docs/previous-agent-progress.md` or the last message in `docs/raw-session-history.md`; completion and persistence claims contradict source and executable tests.
- The `EACCES` evidence-export message in `docs/failed-test-output.txt` is unrelated noise. On this machine, PowerShell may block `npm.ps1`; `npm.cmd` is the Windows execution-policy equivalent of the canonical `npm` commands below.
- Do not use `evidence/before.md` or `evidence/before.patch` as requirements.

## Verification

From `bugfix-context-app` run the canonical repository commands:

```powershell
npm run test:incident
npm run typecheck
npm run agent:check
```

If PowerShell blocks `npm.ps1`, run the same commands with `npm.cmd` in place of `npm`. Expected incident result: all 10 checks pass. `agent:check` also validates build and protected starter artifacts. Run `npm run test:handoff` only after the exercise evidence set is complete; its verifier requires all evidence artifacts, not just the incident implementation.

## Suggested skills

- No specialized skill is required for this narrow TypeScript fix; use repository inspection and test execution. If work must cross another session boundary, invoke the installed `handoff` skill and reference this document plus the authoritative files rather than copying them.
