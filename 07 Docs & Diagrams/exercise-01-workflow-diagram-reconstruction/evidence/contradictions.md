# Recorded Contradictions

## LEG-01 — High-risk requests do not go directly to the data owner

Disputed claim: “directly to data-owner approval.”

Source: `workflow-reconstruction-app/src/workflow.tsx:71-77` routes a manager-approved high-risk request to `security-review` before data-owner review.

Decision: The diagrams show the high risk branch entering security review and reaching data-owner review only after Security approval. The legacy shortcut is not represented.

## LEG-02 — Security review is part of application routing

Disputed claim: “Security review happens outside this application and does not affect routing.”

Source: `workflow-reconstruction-app/src/workflow.tsx:71-77` creates the security-review transition, and `workflow-reconstruction-app/src/App.tsx:24-25` advances application state through `nextStepFor`.

Decision: The approval sequence includes PolicyEngine, Application, and Security interactions. Security is treated as an implemented high-risk route, not an external footnote.

## LEG-03 — Failed provisioning does not retry automatically

Disputed claim: “Provisioning failures retry automatically until access is granted.”

Source: `workflow-reconstruction-app/src/workflow.tsx:108-140` moves unhealthy provisioning to `failed-provisioning`, then `rollback-requested`, then `rolled-back`; there is no automatic retry transition.

Decision: The state and failure diagrams show the failure-to-rollback path and omit an automatic retry edge. The UI’s manual “Retry provisioning” control does not change the protected workflow route and is not treated as an automatic transition.

## LEG-04 — Identity admin owns rollback completion

Disputed claim: “Rollback and identity-administrator actions are outside the application.”

Source: `workflow-reconstruction-app/src/workflow.tsx:125-140` implements rollback request and completion, assigns completion to `Identity admin`, and reaches `rolled-back`. `workflow-reconstruction-app/src/workflow.tsx:9-11` includes the rollback states.

Decision: The failure diagram shows IdentityAdmin removing partial access, and the state diagram treats both `provisioned` and `rolled_back` as completed terminal paths.

## CODE-01 — Normal progress falsely completes security review

Disputed behavior: `completedStagesByStatus` marks `security-review` complete for every `data-owner-review` request, including normal risk.

Source: `workflow-reconstruction-app/src/workflow.tsx:19` includes `security-review` in completed stages, while the normal branch at `workflow-reconstruction-app/src/workflow.tsx:80-86` never enters that state. `workflow-reconstruction-app/src/App.tsx:16` builds and later renders this projection.

Decision: The diagrams follow `nextStepFor` and protected traces, so security review appears only on the high-risk route. The UI progress conflict is documented and deferred because the implementation inputs are protected.
