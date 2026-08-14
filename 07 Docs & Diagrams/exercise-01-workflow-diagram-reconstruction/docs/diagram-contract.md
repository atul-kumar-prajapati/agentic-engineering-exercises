# Diagram Contract

Use these state aliases exactly:

`draft`, `submitted`, `manager_approved`, `security_review`, `data_owner_review`, `provisioning`, `provisioned`, `failed_provisioning`, `rollback_requested`, and `rolled_back`.

The state diagram starts with `stateDiagram-v2`. Label conditional transitions with `high risk`, `normal risk`, `healthy`, or `unhealthy`. Do not add an automatic retry edge from `failed_provisioning` to `provisioning`.

Both sequence diagrams start with `sequenceDiagram`. Use these participant aliases where applicable: `Employee`, `Application`, `Manager`, `PolicyEngine`, `Security`, `DataOwner`, `IdentityProvider`, and `IdentityAdmin`.

The approval sequence uses an `alt High risk` and `else Normal risk` block. The failure sequence shows the provisioning failure, rollback request, identity-admin removal, and rollback completion.

Add `%% EDGE: <ID>` comments for every edge listed in the evidence template. The verifier uses the IDs to connect diagrams, traceability, and source.
