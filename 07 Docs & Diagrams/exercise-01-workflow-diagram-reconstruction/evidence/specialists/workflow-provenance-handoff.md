# Workflow Provenance Handoff

Scope: source provenance, actors, conditions, and contradictions. No files were modified.

Verification: `npm run workflow:trace` exited `0` at the then-current source-led diagram attempt. Normal, high-risk, failure, and rollback traces matched the protected implementation.

## Edge Findings

| Edge | Source marker | Result |
| --- | --- | --- |
| WF-01 | `workflow.tsx:52` | Accept: draft to submitted; Employee |
| WF-02 | `workflow.tsx:62` | Accept: submitted to manager-approved; Manager |
| WF-03 | `workflow.tsx:71` | Accept: manager-approved high risk to security-review; Policy engine |
| WF-04 | `workflow.tsx:80` | Accept with nuance: fall-through after high-risk guard; fixtures/contracts call it normal risk; Data owner |
| WF-05 | `workflow.tsx:89` | Accept: security-review to data-owner-review; Security |
| WF-06 | `workflow.tsx:98` | Accept: data-owner-review to provisioning; Data owner |
| WF-07 | `workflow.tsx:109` | Accept: healthy provisioning to provisioned; Provisioning system |
| WF-08 | `workflow.tsx:110` | Accept: unhealthy provisioning to failed-provisioning; Provisioning system |
| WF-09 | `workflow.tsx:125` | Accept: failed-provisioning to rollback-requested; Provisioning system |
| WF-10 | `workflow.tsx:134` | Accept: rollback-requested to rolled-back; Identity admin |

## Contradiction Findings

- Fix in evidence: record the omitted high-risk security path (`LEG-01`) and false outside-application security claim (`LEG-02`).
- Fix in evidence: reject automatic retry and show rollback (`LEG-03`).
- Fix in evidence: identify Identity admin and rolled-back completion (`LEG-04`).
- Defer protected source correction: document the normal-path `completedStagesByStatus` conflict (`CODE-01`).

Integration disposition: all diagram mappings accepted; all evidence fixes implemented in `traceability.json` and `contradictions.md`; protected UI correction deferred.
