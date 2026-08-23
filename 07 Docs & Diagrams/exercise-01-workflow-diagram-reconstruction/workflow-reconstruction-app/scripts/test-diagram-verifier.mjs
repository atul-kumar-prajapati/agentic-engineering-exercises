import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyDiagramSubmission } from "./diagram-verification.mjs";

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const edges = [
  ["WF-01", "draft", "submitted", "Employee", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-02", "submitted", "manager-approved", "Manager", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-03", "manager-approved", "security-review", "Policy engine", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-04", "manager-approved", "data-owner-review", "Data owner", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-05", "security-review", "data-owner-review", "Security", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-06", "data-owner-review", "provisioning", "Data owner", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd", "diagrams/access-failure-sequence.mmd"]],
  ["WF-07", "provisioning", "provisioned", "Provisioning system", ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]],
  ["WF-08", "provisioning", "failed-provisioning", "Provisioning system", ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"]],
  ["WF-09", "failed-provisioning", "rollback-requested", "Provisioning system", ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"]],
  ["WF-10", "rollback-requested", "rolled-back", "Identity admin", ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"]],
];

const stateDiagram = `stateDiagram-v2
  [*] --> draft
  %% EDGE: WF-01
  draft --> submitted
  %% EDGE: WF-02
  submitted --> manager_approved
  %% EDGE: WF-03
  manager_approved --> security_review : high risk
  %% EDGE: WF-04
  manager_approved --> data_owner_review : normal risk
  %% EDGE: WF-05
  security_review --> data_owner_review
  %% EDGE: WF-06
  data_owner_review --> provisioning
  %% EDGE: WF-07
  provisioning --> provisioned : healthy
  %% EDGE: WF-08
  provisioning --> failed_provisioning : unhealthy
  %% EDGE: WF-09
  failed_provisioning --> rollback_requested
  %% EDGE: WF-10
  rollback_requested --> rolled_back
  provisioned --> [*]
  rolled_back --> [*]
`;

const approvalDiagram = `sequenceDiagram
  actor Employee
  participant Application
  participant Manager
  participant PolicyEngine
  participant Security
  participant DataOwner
  participant IdentityProvider
  %% EDGE: WF-01
  Employee->>Application: Submit access request
  %% EDGE: WF-02
  Application->>Manager: Request manager approval
  Manager-->>Application: Manager approved
  alt High risk
    %% EDGE: WF-03
    PolicyEngine->>Security: Route high risk to security
    %% EDGE: WF-05
    Security-->>Application: Security approved
    Application->>DataOwner: Open data owner review
  else Normal risk
    %% EDGE: WF-04
    Application->>DataOwner: Open normal data owner review
  end
  %% EDGE: WF-06
  DataOwner-->>Application: Approve data owner access
  Application->>IdentityProvider: Provision access
  %% EDGE: WF-07
  IdentityProvider-->>Application: Access granted and provisioned
`;

const failureDiagram = `sequenceDiagram
  participant Application
  participant DataOwner
  participant IdentityProvider
  participant IdentityAdmin
  %% EDGE: WF-06
  DataOwner->>Application: Approve data access
  Application->>IdentityProvider: Provision access
  %% EDGE: WF-08
  IdentityProvider-->>Application: Provisioning failed after partial access
  %% EDGE: WF-09
  Application->>IdentityProvider: Open rollback request
  IdentityProvider->>IdentityAdmin: Remove partial access
  %% EDGE: WF-10
  IdentityAdmin-->>Application: Partial access removed and rolled back
`;

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diagram-verifier-"));
try {
  const repositoryRoot = path.join(temporaryRoot, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "workflow-reconstruction-app");
  fs.mkdirSync(appRoot, { recursive: true });
  git(repositoryRoot, ["init"]);
  git(repositoryRoot, ["config", "core.autocrlf", "false"]);
  git(repositoryRoot, ["config", "user.name", "Verifier Test"]);
  git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);
  const sourceLines = ["export function nextStepFor() {"];
  for (const [id] of edges) sourceLines.push(`  // EDGE: ${id}`);
  sourceLines.push("}");
  write(appRoot, "src/workflow.tsx", `${sourceLines.join("\n")}\n`);
  write(appRoot, "src/data/accessRequests.tsx", "export const accessRequests = [];\n");
  write(appRoot, "src/App.tsx", "export default function App() { return null; }\n");
  write(exerciseRoot, "docs/legacy-workflow-description.md", "Legacy automatic retry and no security review.\n");
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "test: create workflow source"]);

  const diagramFiles = {
    state: write(exerciseRoot, "diagrams/access-state.mmd", stateDiagram),
    approval: write(exerciseRoot, "diagrams/access-approval-sequence.mmd", approvalDiagram),
    failure: write(exerciseRoot, "diagrams/access-failure-sequence.mmd", failureDiagram),
  };
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "docs: reconstruct workflow diagrams"]);
  const sourceSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  const workflowSource = git(repositoryRoot, ["show", `${sourceSha}:exercise/workflow-reconstruction-app/src/workflow.tsx`]).split(/\r?\n/);
  const traceEdges = edges.map(([id, from, to, actor, diagramPaths]) => {
    const sourceLine = workflowSource.findIndex((line) => line.includes(`EDGE: ${id}`)) + 1;
    return {
      id, from, to, actor,
      condition: `The protected implementation selects the ${from} to ${to} transition.`,
      source_path: "workflow-reconstruction-app/src/workflow.tsx",
      source_line: sourceLine,
      source_excerpt: workflowSource[sourceLine - 1].trim(),
      diagram_paths: diagramPaths,
    };
  });
  const traceFile = write(exerciseRoot, "evidence/traceability.json", `${JSON.stringify({ schema_version: 1, source_sha: sourceSha, edges: traceEdges }, null, 2)}\n`);
  const contradictionFile = write(exerciseRoot, "evidence/contradictions.md", `# Contradictions

## LEG-01
High risk requests require security. Source: workflow.tsx. Decision: show the security route.
## LEG-02
Security runs inside the application workflow. Source: workflow.tsx. Decision: show application security interaction.
## LEG-03
The legacy automatic retry is false and rollback follows failure. Source: workflow.tsx. Decision: show rollback.
## LEG-04
Identity admin completes rolled-back state. Source: workflow.tsx. Decision: show identity admin.
## CODE-01
completedStagesByStatus marks security-review complete on the normal route. Source: workflow.tsx. Decision: follow nextStepFor and document the conflict.
`);
  const workflowOutput = write(exerciseRoot, "evidence/commands/workflow-trace.txt", `Source SHA: ${sourceSha}\nPASS: normal approval, high-risk security review, provisioning failure, and rollback traces match the implementation. Full scenario states and actors were captured for review.\n`);
  const parseOutput = write(exerciseRoot, "evidence/commands/diagram-parse.txt", `Source SHA: ${sourceSha}\nPASS: access-state.mmd parsed as stateDiagram. PASS: both approval and failure files parsed as sequence diagrams. All three Mermaid inputs passed.\n`);
  const manifest = {
    schema_version: 1,
    source_sha: sourceSha,
    diagrams: [
      { id: "state", path: "diagrams/access-state.mmd", type: "stateDiagram", sha256: hash(diagramFiles.state) },
      { id: "approval", path: "diagrams/access-approval-sequence.mmd", type: "sequence", sha256: hash(diagramFiles.approval) },
      { id: "failure", path: "diagrams/access-failure-sequence.mmd", type: "sequence", sha256: hash(diagramFiles.failure) },
    ],
    artifacts: {
      traceability: { path: "evidence/traceability.json", sha256: hash(traceFile) },
      contradictions: { path: "evidence/contradictions.md", sha256: hash(contradictionFile) },
    },
    commands: {
      workflow_trace: { command: "npm run workflow:trace", exit_code: 0, output_path: "evidence/commands/workflow-trace.txt", output_sha256: hash(workflowOutput) },
      diagram_parse: { command: "npm run diagrams:parse", exit_code: 0, output_path: "evidence/commands/diagram-parse.txt", output_sha256: hash(parseOutput) },
    },
  };
  write(exerciseRoot, "evidence/diagram-manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  write(exerciseRoot, "evidence/verification.md", `# Verification

Source SHA: ${sourceSha}. Mermaid parser passed all files. Semantic verifier matched every transition and actor. Scenario trace passed. Unsupported edge check found none. Five contradictions were recorded. Remaining ambiguity: the progress projection conflict remains documented. Final conclusion: diagrams are approved.
`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "evidence: verify workflow diagrams"]);

  assert.deepEqual(await verifyDiagramSubmission({ repositoryRoot, appRoot, exerciseRoot }), []);
  const originalTrace = fs.readFileSync(traceFile, "utf8");
  const trace = JSON.parse(fs.readFileSync(traceFile, "utf8"));
  trace.edges[0].to = "provisioned";
  fs.writeFileSync(traceFile, JSON.stringify(trace));
  assert.ok((await verifyDiagramSubmission({ repositoryRoot, appRoot, exerciseRoot })).some((failure) => failure.includes("transition or actor differs")));
  fs.writeFileSync(traceFile, originalTrace);

  fs.appendFileSync(path.join(appRoot, "src/workflow.tsx"), "// later workflow change invalidates the submitted diagrams\n");
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "test: change workflow after diagram source"]);
  assert.ok((await verifyDiagramSubmission({ repositoryRoot, appRoot, exerciseRoot })).some((failure) => failure.includes("protected workflow sources changed after source_sha")));
  console.log("workflow diagram verifier self-test passed");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
