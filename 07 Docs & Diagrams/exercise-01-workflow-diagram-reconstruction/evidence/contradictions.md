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

## CODE-01 — UI progress falsely completes security review on the normal route

Disputed behavior: `completedStagesByStatus` lists `security-review` as a completed stage for six statuses — `data-owner-review`, `provisioning`, `provisioned`, `failed-provisioning`, `rollback-requested`, and `rolled-back` — so any normal-risk request past manager approval renders security review as complete even though the normal branch never enters that state.

Source: `workflow-reconstruction-app/src/workflow.tsx:19-48` repeats `security-review` in the completed list for all six statuses above, while the normal branch at `workflow-reconstruction-app/src/workflow.tsx:80-86` routes `manager-approved` straight to `data-owner-review`. `workflow-reconstruction-app/src/App.tsx:16` builds and later renders this projection. The same projection helper at `workflow-reconstruction-app/src/workflow.tsx:196-205` maps every one of the ten `workflowStages` for every request, so a terminal `provisioned` request also shows `failed-provisioning`, `rollback-requested`, and `rolled-back` as waiting work.

Decision: The diagrams follow `nextStepFor` and the protected traces, so `security_review` appears only on the high-risk route and both `provisioned` and `rolled_back` terminate at `[*]`. Both halves of the projection conflict are recorded here as one UI contradiction and deferred, because `src/workflow.tsx` is a protected input and the exercise requires the conflict to stay visible rather than be silently resolved.
