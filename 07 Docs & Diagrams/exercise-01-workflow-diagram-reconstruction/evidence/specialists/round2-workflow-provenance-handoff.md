# Round-Two Workflow Provenance Handoff

Scope: re-derive `WF-01` through `WF-10` and the five contradictions from protected source, independently of the first-round record. Read-only; no files modified, no mutating Git commands.

Verification: `npm run workflow:trace` exited `0`.

## Edge Findings

All ten records re-verified against `src/workflow.tsx`: `source_line` contains `source_excerpt` verbatim, the `EDGE: WF-xx` marker matches the id, and the declared `from`, `to`, `condition`, and `actor` agree with the implementation. Every `diagram_paths` entry carries a matching `%% EDGE:` marker.

No implemented transition is missing. `nextStepFor` holds exactly ten transition returns plus the terminal no-op at `workflow.tsx:143-146`. No other module mutates `request.status`; `App.tsx:31-47` flips `provisioningHealthy` and the integration badge only.

`WF-04` re-confirmed as a fall-through after the high-risk guard rather than an explicit `risk === "normal"` test. The traceability record already states this, and `docs/diagram-contract.md:7` mandates the `normal risk` label, so no change was required.

## Contradiction Findings

| ID | Result |
| --- | --- |
| LEG-01 | Accept: quote verbatim at `docs/legacy-workflow-description.md:5`; `workflow.tsx:71-77` interposes `security-review` |
| LEG-02 | Accept: `workflow.tsx:71-77` with `App.tsx:24-25` prove in-application routing |
| LEG-03 | Accept: no guard anywhere returns `provisioning` from `failed-provisioning`; the UI retry control leaves `status` untouched |
| LEG-04 | Accept: `workflow.tsx:125-140` implements both rollback steps and reaches terminal `rolled-back` |
| CODE-01 | **Fix in evidence**: the recorded scope was too narrow. `security-review` is listed complete for six statuses at `workflow.tsx:19-48`, not only `data-owner-review` |

## Unsupported Diagram Claims

- **Fix in diagram**: `diagrams/access-failure-sequence.mmd:17` carried `Application->>IdentityAdmin: Assign partial access removal` under `WF-09`. `WF-09` (`workflow.tsx:125-131`) has actor `Provisioning system` and performs no identity-admin assignment; the identity admin first acts at `WF-10`.
- **Fix in evidence**: `buildFlowSteps` (`workflow.tsx:196-205`) renders all ten `workflowStages` for every request, so a terminal `provisioned` request shows the rollback stages as waiting work. Same UI-projection defect class as `CODE-01`.
- Note for the integration owner: `scripts/trace-workflow.mjs:25-27` builds three scenarios (`normal`, `highRisk`, `failure`), not four; rollback is the tail of `failure`. First-round evidence phrased this as four traces.

## Integration Disposition

`CODE-01` rewritten with the correct six-status scope and the `buildFlowSteps` half folded in as the same contradiction, keeping the required count at five. `access-failure-sequence.mmd:17` replaced with the code-backed `Mark identity provider degraded` (`workflow.tsx:129`). Trace-count wording corrected in `verification.md`. All ten edge mappings accepted unchanged.
