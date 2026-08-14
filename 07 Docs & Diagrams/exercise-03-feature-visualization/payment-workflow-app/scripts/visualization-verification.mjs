import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseMermaid } from "./mermaid-parser.mjs";

const DIAGRAMS = {
  architecture: { path: "diagrams/payment-architecture.mmd", type: "flowchart-v2" },
  state: { path: "diagrams/webhook-reconciliation-state.mmd", type: "stateDiagram" },
  sequence: { path: "diagrams/payment-sequence.mmd", type: "sequence" },
  data: { path: "diagrams/payment-data.mmd", type: "er" },
};

const RELATIONSHIPS = {
  "VIS-01": { source: "payment-workflow-app/src/App.tsx", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-02": { source: "payment-workflow-app/src/payment/paymentOrchestrator.ts", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-03": { source: "payment-workflow-app/src/payment/paymentOrchestrator.ts", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-04": { source: "payment-workflow-app/src/payment/paymentOrchestrator.ts", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-05": { source: "payment-workflow-app/src/payment/paymentOrchestrator.ts", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-06": { source: "payment-workflow-app/src/payment/paymentOrchestrator.ts", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.sequence.path] },
  "VIS-07": { source: "payment-workflow-app/src/payment/webhookReconciler.mjs", diagrams: [DIAGRAMS.architecture.path, DIAGRAMS.state.path, DIAGRAMS.sequence.path] },
  "VIS-08": { source: "payment-workflow-app/src/payment/webhookReconciler.mjs", diagrams: [DIAGRAMS.state.path, DIAGRAMS.sequence.path] },
  "VIS-09": { source: "payment-workflow-app/src/payment/webhookReconciler.mjs", diagrams: [DIAGRAMS.state.path, DIAGRAMS.sequence.path] },
  "VIS-10": { source: "payment-workflow-app/src/payment/webhookReconciler.mjs", diagrams: [DIAGRAMS.state.path, DIAGRAMS.sequence.path] },
  "VIS-11": { source: "payment-workflow-app/src/payment/webhookReconciler.mjs", diagrams: [DIAGRAMS.state.path, DIAGRAMS.sequence.path] },
  "VIS-12": { source: "payment-workflow-app/src/payment/paymentTypes.ts", diagrams: [DIAGRAMS.data.path] },
  "VIS-13": { source: "payment-workflow-app/src/payment/paymentTypes.ts", diagrams: [DIAGRAMS.data.path] },
  "VIS-14": { source: "payment-workflow-app/src/payment/paymentTypes.ts", diagrams: [DIAGRAMS.data.path] },
  "VIS-15": { source: "payment-workflow-app/src/payment/paymentTypes.ts", diagrams: [DIAGRAMS.data.path] },
  "VIS-16": { source: "payment-workflow-app/src/payment/paymentTypes.ts", diagrams: [DIAGRAMS.data.path] },
};

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) { failures.push(`missing ${label}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { failures.push(`${label} is invalid JSON`); return null; }
}

function resolveInside(root, relative, failures, label) {
  if (typeof relative !== "string" || !relative) { failures.push(`${label} path is missing`); return null; }
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) { failures.push(`${label} path escapes the exercise`); return null; }
  return absolute;
}

function markerCount(source, id) {
  return source.match(new RegExp(`%%\\s*EDGE:\\s*${id}\\b`, "g"))?.length ?? 0;
}

function verifyArchitecture(source, failures) {
  for (const node of ["CheckoutUI", "Orchestrator", "GatewayAdapter", "LedgerRecord", "ReceiptRecord", "WebhookHandler"]) if (!source.includes(node)) failures.push(`architecture diagram is missing ${node}`);
  const actual = [...source.matchAll(/^\s*(\w+)\s*-->\s*(\w+)\s*$/gm)].map((match) => `${match[1]}->${match[2]}`);
  const expected = [
    "CheckoutUI->Orchestrator",
    "Orchestrator->GatewayAdapter",
    "Orchestrator->LedgerRecord",
    "Orchestrator->ReceiptRecord",
    "GatewayAdapter->WebhookHandler",
    "WebhookHandler->LedgerRecord",
  ];
  for (const relation of expected) if (!actual.includes(relation)) failures.push(`architecture diagram is missing ${relation}`);
  for (const relation of actual) if (!expected.includes(relation)) failures.push(`architecture diagram contains unsupported relationship ${relation}`);
  if (actual.length !== expected.length) failures.push("architecture diagram must contain exactly six dependency lines");
}

function verifyState(source, failures) {
  const transitions = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*(\[\*\]|[a-z_]+)\s*-->\s*(\[\*\]|[a-z_]+)(?:\s*:\s*(.+))?\s*$/);
    if (match) transitions.push({ from: match[1], to: match[2], label: match[3] ?? "" });
  }
  const expected = {
    "[*]->received": null,
    "received->signature_check": null,
    "signature_check->rejected": /invalid/i,
    "signature_check->reference_check": /valid/i,
    "reference_check->rejected": /unknown/i,
    "reference_check->duplicate_check": /known/i,
    "duplicate_check->already_handled": /duplicate|handled/i,
    "duplicate_check->ledger_recorded": /new/i,
    "ledger_recorded->handled": null,
    "rejected->[*]": null,
    "already_handled->[*]": null,
    "handled->[*]": null,
  };
  for (const [key, label] of Object.entries(expected)) {
    const [from, to] = key.split("->");
    const matches = transitions.filter((item) => item.from === from && item.to === to);
    if (matches.length !== 1) failures.push(`state diagram must contain ${from} --> ${to} exactly once`);
    else if (label && !label.test(matches[0].label)) failures.push(`state transition ${from} --> ${to} has the wrong condition`);
  }
  for (const transition of transitions) if (!( `${transition.from}->${transition.to}` in expected)) failures.push(`state diagram contains unsupported transition ${transition.from} --> ${transition.to}`);
  if (transitions.length !== Object.keys(expected).length) failures.push("state diagram must contain exactly the implemented transitions and terminal edges");
}

function verifySequence(source, failures) {
  for (const actor of ["Shopper", "CheckoutUI", "Orchestrator", "GatewayAdapter", "Ledger", "ReceiptNotifier", "WebhookHandler"]) {
    if (!new RegExp(`(?:participant|actor)\\s+${actor}\\b`).test(source)) failures.push(`sequence diagram is missing ${actor}`);
  }
  for (const block of [/alt\s+Authorization approved/i, /else\s+Authorization declined/i, /alt\s+First delivery/i, /else\s+Duplicate delivery/i]) if (!block.test(source)) failures.push(`sequence diagram is missing ${block}`);
  for (const term of ["authorization", "capture", "ledger", "receipt", "invalid signature", "unknown reference", "already-handled"]) if (!source.toLowerCase().includes(term)) failures.push(`sequence diagram is missing ${term}`);
}

function verifyData(source, failures) {
  const expected = [
    "CUSTOMER ||--o{ CHECKOUT_ORDER",
    "CHECKOUT_ORDER ||--|{ ORDER_ITEM",
    "CHECKOUT_ORDER ||--|| PAYMENT_INTENT",
    "PAYMENT_METHOD ||--o{ PAYMENT_INTENT",
    "PAYMENT_INTENT ||--o{ GATEWAY_TRANSACTION",
    "PAYMENT_INTENT ||--o{ LEDGER_ENTRY",
    "GATEWAY_TRANSACTION ||--o{ WEBHOOK_EVENT",
    "CHECKOUT_ORDER ||--|| RECEIPT",
  ];
  const relationshipLines = source.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^\w+\s+\S+--\S+\s+\w+\s*:/.test(line));
  for (const relation of expected) if (!relationshipLines.some((line) => line.startsWith(`${relation} :`))) failures.push(`data diagram is missing ${relation}`);
  for (const line of relationshipLines) if (!expected.some((relation) => line.startsWith(`${relation} :`))) failures.push(`data diagram contains unsupported relationship ${line}`);
  if (relationshipLines.length !== expected.length) failures.push("data diagram must contain exactly eight relationships");
}

async function verifyDiagrams(exerciseRoot, failures) {
  const sources = {};
  for (const [name, spec] of Object.entries(DIAGRAMS)) {
    const file = path.join(exerciseRoot, spec.path);
    if (!fs.existsSync(file)) { failures.push(`missing ${spec.path}`); continue; }
    const source = fs.readFileSync(file, "utf8");
    sources[name] = source;
    try {
      const parsed = await parseMermaid(source);
      if (parsed.diagramType !== spec.type) failures.push(`${spec.path} must parse as ${spec.type}`);
    } catch (error) { failures.push(`${spec.path} does not parse: ${error.message}`); }
  }
  if (sources.architecture) verifyArchitecture(sources.architecture, failures);
  if (sources.state) verifyState(sources.state, failures);
  if (sources.sequence) verifySequence(sources.sequence, failures);
  if (sources.data) verifyData(sources.data, failures);
  for (const [id, spec] of Object.entries(RELATIONSHIPS)) {
    for (const diagramPath of spec.diagrams) {
      const name = Object.entries(DIAGRAMS).find(([, diagram]) => diagram.path === diagramPath)?.[0];
      if (name && sources[name] && markerCount(sources[name], id) !== 1) failures.push(`${diagramPath} must contain one %% EDGE: ${id} marker`);
    }
    const total = Object.values(sources).reduce((count, source) => count + markerCount(source, id), 0);
    if (total && total !== spec.diagrams.length) failures.push(`${id} must appear only in its required diagrams`);
  }
}

function verifyTraceability(repositoryRoot, exerciseRoot, trace, failures) {
  if (trace?.schema_version !== 1) failures.push("traceability schema_version must be 1");
  if (!/^[a-f0-9]{40}$/i.test(trace?.source_sha ?? "")) { failures.push("traceability source_sha is invalid"); return; }
  const entries = Array.isArray(trace.relationships) ? trace.relationships : [];
  if (entries.length !== 16) failures.push("traceability must contain exactly sixteen relationships");
  for (const [id, expected] of Object.entries(RELATIONSHIPS)) {
    const matches = entries.filter((entry) => entry.id === id);
    if (matches.length !== 1) { failures.push(`traceability must contain one ${id}`); continue; }
    const entry = matches[0];
    if (entry.source_path !== expected.source) failures.push(`${id} source_path must be ${expected.source}`);
    if (JSON.stringify(entry.diagram_paths) !== JSON.stringify(expected.diagrams)) failures.push(`${id} diagram_paths are incorrect`);
    try {
      const source = git(repositoryRoot, ["show", `${trace.source_sha}:${path.relative(repositoryRoot, path.join(exerciseRoot, expected.source)).split(path.sep).join("/")}`]);
      const lines = source.split(/\r?\n/);
      const markerLines = lines.map((line, index) => ({ line, number: index + 1 })).filter((item) => item.line.includes(`VIS: ${id}`));
      if (markerLines.length !== 1) { failures.push(`${id} must have one source marker at source_sha`); continue; }
      if (entry.source_line !== markerLines[0].number || entry.source_excerpt?.trim() !== markerLines[0].line.trim()) failures.push(`${id} source line or excerpt does not match source_sha`);
    } catch { failures.push(`${id} source cannot be read at source_sha`); }
  }
  for (const spec of Object.values(DIAGRAMS)) {
    try { git(repositoryRoot, ["show", `${trace.source_sha}:${path.relative(repositoryRoot, path.join(exerciseRoot, spec.path)).split(path.sep).join("/")}`]); }
    catch { failures.push(`${spec.path} must exist at source_sha`); }
  }
}

function verifyContradictions(file, failures) {
  if (!fs.existsSync(file)) { failures.push("missing evidence/brief-contradictions.md"); return; }
  const source = fs.readFileSync(file, "utf8");
  for (let index = 1; index <= 4; index += 1) {
    const id = `BRIEF-${String(index).padStart(2, "0")}`;
    const start = source.search(new RegExp(`^##\\s+${id}\\b`, "m"));
    if (start === -1) { failures.push(`brief-contradictions.md is missing ${id}`); continue; }
    const next = source.indexOf("\n## ", start + 1);
    const section = source.slice(start, next === -1 ? undefined : next);
    for (const term of ["Claim:", "Result:", "Source:", "Diagram decision:"]) if (!section.toLowerCase().includes(term.toLowerCase())) failures.push(`${id} is missing ${term}`);
    if (!/Result:\s*(supported|rejected)/i.test(section)) failures.push(`${id} result must be supported or rejected`);
  }
}

function verifyArtifact(exerciseRoot, record, expectedPath, failures, label) {
  if (!record || record.path !== expectedPath) { failures.push(`${label} path must be ${expectedPath}`); return; }
  const file = resolveInside(exerciseRoot, record.path, failures, label);
  if (!file || !fs.existsSync(file)) { failures.push(`missing ${expectedPath}`); return; }
  if (!/^[a-f0-9]{64}$/.test(record.sha256 ?? "") || hash(file) !== record.sha256) failures.push(`${label} SHA-256 does not match`);
}

function verifyCommand(exerciseRoot, record, expected, sourceSha, failures, label) {
  if (!record || record.command !== expected.command || record.exit_code !== 0 || record.output_path !== expected.output) { failures.push(`${label} command record is incorrect`); return; }
  const file = resolveInside(exerciseRoot, record.output_path, failures, label);
  if (!file || !fs.existsSync(file)) { failures.push(`missing ${expected.output}`); return; }
  if (!/^[a-f0-9]{64}$/.test(record.output_sha256 ?? "") || hash(file) !== record.output_sha256) failures.push(`${label} output SHA-256 does not match`);
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(sourceSha) || !source.includes("PASS")) failures.push(`${label} output must contain source_sha and PASS`);
}

export async function verifyVisualizationSubmission({ repositoryRoot, exerciseRoot }) {
  const failures = [];
  await verifyDiagrams(exerciseRoot, failures);
  const trace = readJson(path.join(exerciseRoot, "evidence", "traceability.json"), failures, "evidence/traceability.json");
  const manifest = readJson(path.join(exerciseRoot, "evidence", "diagram-manifest.json"), failures, "evidence/diagram-manifest.json");
  if (trace) verifyTraceability(repositoryRoot, exerciseRoot, trace, failures);
  verifyContradictions(path.join(exerciseRoot, "evidence", "brief-contradictions.md"), failures);
  if (manifest) {
    const sourceSha = trace?.source_sha ?? "";
    if (manifest.schema_version !== 1 || manifest.source_sha !== sourceSha) failures.push("manifest schema_version or source_sha is incorrect");
    for (const [name, spec] of Object.entries(DIAGRAMS)) verifyArtifact(exerciseRoot, manifest.diagrams?.[name], spec.path, failures, `${name} diagram`);
    verifyArtifact(exerciseRoot, manifest.evidence?.traceability, "evidence/traceability.json", failures, "traceability artifact");
    verifyArtifact(exerciseRoot, manifest.evidence?.contradictions, "evidence/brief-contradictions.md", failures, "contradictions artifact");
    verifyCommand(exerciseRoot, manifest.commands?.payment_trace, { command: "npm run payment:trace", output: "evidence/commands/payment-trace.txt" }, sourceSha, failures, "payment trace");
    verifyCommand(exerciseRoot, manifest.commands?.diagram_parse, { command: "npm run diagrams:parse", output: "evidence/commands/diagram-parse.txt" }, sourceSha, failures, "diagram parse");
    try {
      const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
      git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
      const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
      const evidencePrefix = `${path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/")}/evidence/`;
      for (const file of changed) if (!file.startsWith(evidencePrefix)) failures.push(`commit after source_sha changes non-evidence file ${file}`);
    } catch { failures.push("source_sha must be an ancestor of HEAD"); }
  }
  const verification = path.join(exerciseRoot, "evidence", "verification.md");
  if (!fs.existsSync(verification)) failures.push("missing evidence/verification.md");
  else for (const term of ["source sha", "feature test", "mermaid parser", "semantic diagram", "traceability", "contradiction", "remaining uncertainty", "final conclusion"]) if (!fs.readFileSync(verification, "utf8").toLowerCase().includes(term)) failures.push(`verification.md is missing ${term}`);
  return [...new Set(failures)];
}
