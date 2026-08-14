import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyVisualizationSubmission } from "./visualization-verification.mjs";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
function write(root, relative, content) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return file; }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "payment-visualization-"));
try {
  const repositoryRoot = path.join(temporary, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "payment-workflow-app");
  fs.mkdirSync(appRoot, { recursive: true });
  git(repositoryRoot, ["init"]); git(repositoryRoot, ["config", "core.autocrlf", "false"]); git(repositoryRoot, ["config", "user.name", "Verifier"]); git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);
  write(appRoot, "src/App.tsx", `const payment = runPaymentScenario(); // VIS: VIS-01\n`);
  write(appRoot, "src/payment/paymentOrchestrator.ts", `authorizePayment(input); // VIS: VIS-02\ncapturePayment(auth); // VIS: VIS-03\ncreateLedgerEntry(); // VIS: VIS-04\ncreateReceipt(); // VIS: VIS-05\nbuildGatewayWebhook(); // VIS: VIS-06\n`);
  write(appRoot, "src/payment/webhookReconciler.mjs", `state.ledgerEntries.push(entry); // VIS: VIS-07\nthrow new Error("Invalid signature"); // VIS: VIS-08\nthrow new Error("Unknown gateway reference"); // VIS: VIS-09\nreturn "already-handled"; // VIS: VIS-10\nstate.handledEventIds.add(event.id); // VIS: VIS-11\n`);
  write(appRoot, "src/payment/paymentTypes.ts", `orderId: string; // VIS: VIS-12\nintentId: string; // VIS: VIS-13\npaymentIntentId: string; // VIS: VIS-14\ngatewayReference: string; // VIS: VIS-15\nreceiptOrderId: string; // VIS: VIS-16\n`);

  const architecture = write(exerciseRoot, "diagrams/payment-architecture.mmd", `flowchart LR
CheckoutUI[Checkout UI]
Orchestrator[Payment orchestrator]
GatewayAdapter[Gateway adapter]
LedgerRecord[Ledger record]
ReceiptRecord[Receipt record]
WebhookHandler[Webhook handler]
%% EDGE: VIS-01
CheckoutUI --> Orchestrator
%% EDGE: VIS-02
%% EDGE: VIS-03
Orchestrator --> GatewayAdapter
%% EDGE: VIS-04
Orchestrator --> LedgerRecord
%% EDGE: VIS-05
Orchestrator --> ReceiptRecord
%% EDGE: VIS-06
GatewayAdapter --> WebhookHandler
%% EDGE: VIS-07
WebhookHandler --> LedgerRecord
`);
  const state = write(exerciseRoot, "diagrams/webhook-reconciliation-state.mmd", `stateDiagram-v2
[*] --> received
received --> signature_check
%% EDGE: VIS-08
signature_check --> rejected : invalid signature
signature_check --> reference_check : valid signature
%% EDGE: VIS-09
reference_check --> rejected : unknown reference
reference_check --> duplicate_check : known reference
%% EDGE: VIS-10
duplicate_check --> already_handled : duplicate event
%% EDGE: VIS-07
duplicate_check --> ledger_recorded : new event
%% EDGE: VIS-11
ledger_recorded --> handled
rejected --> [*]
already_handled --> [*]
handled --> [*]
`);
  const sequence = write(exerciseRoot, "diagrams/payment-sequence.mmd", `sequenceDiagram
actor Shopper
participant CheckoutUI
participant Orchestrator
participant GatewayAdapter
participant Ledger
participant ReceiptNotifier
participant WebhookHandler
Shopper->>CheckoutUI: Confirm checkout
%% EDGE: VIS-01
CheckoutUI->>Orchestrator: Create payment intent
%% EDGE: VIS-02
Orchestrator->>GatewayAdapter: Request authorization
alt Authorization approved
  %% EDGE: VIS-03
  Orchestrator->>GatewayAdapter: Capture authorization
  %% EDGE: VIS-04
  Orchestrator->>Ledger: Write authorization and capture ledger records
  %% EDGE: VIS-05
  Orchestrator->>ReceiptNotifier: Send receipt
else Authorization declined
  Orchestrator->>Ledger: Record payment failure
  Orchestrator->>ReceiptNotifier: Block receipt
end
%% EDGE: VIS-06
GatewayAdapter->>WebhookHandler: Deliver captured event
WebhookHandler-->>Shopper: Invalid signature rejected
%% EDGE: VIS-08
WebhookHandler-->>Shopper: Signature decision
WebhookHandler-->>Shopper: Unknown reference rejected
%% EDGE: VIS-09
WebhookHandler-->>Shopper: Reference decision
alt First delivery
  %% EDGE: VIS-07
  WebhookHandler->>Ledger: Write one capture record
  %% EDGE: VIS-11
  WebhookHandler-->>GatewayAdapter: Mark handled and return recorded
else Duplicate delivery
  %% EDGE: VIS-10
  WebhookHandler-->>GatewayAdapter: Return already-handled
end
`);
  const data = write(exerciseRoot, "diagrams/payment-data.mmd", `erDiagram
CUSTOMER ||--o{ CHECKOUT_ORDER : places
CHECKOUT_ORDER ||--|{ ORDER_ITEM : contains
%% EDGE: VIS-12
CHECKOUT_ORDER ||--|| PAYMENT_INTENT : funds
PAYMENT_METHOD ||--o{ PAYMENT_INTENT : used_by
%% EDGE: VIS-13
PAYMENT_INTENT ||--o{ GATEWAY_TRANSACTION : produces
%% EDGE: VIS-14
PAYMENT_INTENT ||--o{ LEDGER_ENTRY : posts
%% EDGE: VIS-15
GATEWAY_TRANSACTION ||--o{ WEBHOOK_EVENT : emits
%% EDGE: VIS-16
CHECKOUT_ORDER ||--|| RECEIPT : receives
`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "source and diagrams"]); const sourceSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  const relationshipSpecs = {
    "VIS-01": ["payment-workflow-app/src/App.tsx", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-02": ["payment-workflow-app/src/payment/paymentOrchestrator.ts", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-03": ["payment-workflow-app/src/payment/paymentOrchestrator.ts", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-04": ["payment-workflow-app/src/payment/paymentOrchestrator.ts", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-05": ["payment-workflow-app/src/payment/paymentOrchestrator.ts", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-06": ["payment-workflow-app/src/payment/paymentOrchestrator.ts", ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-07": ["payment-workflow-app/src/payment/webhookReconciler.mjs", ["diagrams/payment-architecture.mmd", "diagrams/webhook-reconciliation-state.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-08": ["payment-workflow-app/src/payment/webhookReconciler.mjs", ["diagrams/webhook-reconciliation-state.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-09": ["payment-workflow-app/src/payment/webhookReconciler.mjs", ["diagrams/webhook-reconciliation-state.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-10": ["payment-workflow-app/src/payment/webhookReconciler.mjs", ["diagrams/webhook-reconciliation-state.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-11": ["payment-workflow-app/src/payment/webhookReconciler.mjs", ["diagrams/webhook-reconciliation-state.mmd", "diagrams/payment-sequence.mmd"]],
    "VIS-12": ["payment-workflow-app/src/payment/paymentTypes.ts", ["diagrams/payment-data.mmd"]],
    "VIS-13": ["payment-workflow-app/src/payment/paymentTypes.ts", ["diagrams/payment-data.mmd"]],
    "VIS-14": ["payment-workflow-app/src/payment/paymentTypes.ts", ["diagrams/payment-data.mmd"]],
    "VIS-15": ["payment-workflow-app/src/payment/paymentTypes.ts", ["diagrams/payment-data.mmd"]],
    "VIS-16": ["payment-workflow-app/src/payment/paymentTypes.ts", ["diagrams/payment-data.mmd"]],
  };
  const relationships = Object.entries(relationshipSpecs).map(([id, [sourcePath, diagramPaths]]) => {
    const lines = fs.readFileSync(path.join(exerciseRoot, sourcePath), "utf8").split(/\r?\n/);
    const sourceLine = lines.findIndex((line) => line.includes(`VIS: ${id}`)) + 1;
    return { id, source_path: sourcePath, source_line: sourceLine, source_excerpt: lines[sourceLine - 1].trim(), diagram_paths: diagramPaths };
  });
  const trace = write(exerciseRoot, "evidence/traceability.json", `${JSON.stringify({ schema_version: 1, source_sha: sourceSha, relationships }, null, 2)}\n`);
  const contradictions = write(exerciseRoot, "evidence/brief-contradictions.md", `${[1,2,3,4].map((number) => `## BRIEF-0${number}\nClaim: legacy claim ${number}.\nResult: rejected.\nSource: protected implementation and feature tests show the implemented boundary.\nDiagram decision: the diagrams show the verified behavior and omit the unsupported claim.`).join("\n\n")}\n`);
  const paymentOutput = write(exerciseRoot, "evidence/commands/payment-trace.txt", `Source SHA: ${sourceSha}\nApproved and declined checkout paths passed. First, duplicate, invalid-signature, and unknown-reference webhook paths passed. PASS payment trace.\n`);
  const parseOutput = write(exerciseRoot, "evidence/commands/diagram-parse.txt", `Source SHA: ${sourceSha}\nPASS payment-architecture.mmd, webhook-reconciliation-state.mmd, payment-sequence.mmd, and payment-data.mmd parsed with the expected Mermaid types.\n`);
  write(exerciseRoot, "evidence/diagram-manifest.json", `${JSON.stringify({ schema_version: 1, source_sha: sourceSha, diagrams: { architecture: { path: "diagrams/payment-architecture.mmd", type: "flowchart-v2", sha256: hash(architecture) }, state: { path: "diagrams/webhook-reconciliation-state.mmd", type: "stateDiagram", sha256: hash(state) }, sequence: { path: "diagrams/payment-sequence.mmd", type: "sequence", sha256: hash(sequence) }, data: { path: "diagrams/payment-data.mmd", type: "er", sha256: hash(data) } }, evidence: { traceability: { path: "evidence/traceability.json", sha256: hash(trace) }, contradictions: { path: "evidence/brief-contradictions.md", sha256: hash(contradictions) } }, commands: { payment_trace: { command: "npm run payment:trace", exit_code: 0, output_path: "evidence/commands/payment-trace.txt", output_sha256: hash(paymentOutput) }, diagram_parse: { command: "npm run diagrams:parse", exit_code: 0, output_path: "evidence/commands/diagram-parse.txt", output_sha256: hash(parseOutput) } } }, null, 2)}\n`);
  write(exerciseRoot, "evidence/verification.md", `Source SHA: ${sourceSha}. Feature test passed. Mermaid parser passed. Semantic diagram verification passed. Traceability passed. Contradiction review passed. Remaining uncertainty: none. Final conclusion: approved.\n`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "evidence"]);
  assert.deepEqual(await verifyVisualizationSubmission({ repositoryRoot, exerciseRoot }), []);
  const tampered = JSON.parse(fs.readFileSync(trace, "utf8")); tampered.relationships[0].source_line = 999; fs.writeFileSync(trace, JSON.stringify(tampered));
  assert.ok((await verifyVisualizationSubmission({ repositoryRoot, exerciseRoot })).some((failure) => failure.includes("source line or excerpt")));
  console.log("payment visualization verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
