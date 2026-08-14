import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const incidentPrompt = "Correct recognized-revenue totals in the dashboard and scheduled snapshot. Use the current metric rules and billing-account boundaries, preserve gross-volume behaviour, and reject events without a valid account mapping.";

function readRequired(relativePath) {
  const absolutePath = path.join(exerciseRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required evidence file: ${relativePath}`);
    return "";
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.trim()) failures.push(`evidence file is empty: ${relativePath}`);
  return content;
}

function field(content, name) {
  return content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
}

function sha256(absolutePath) {
  const normalized = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function verifyStarterIntegrity() {
  const manifestPath = path.join(appRoot, "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("challenge integrity manifest is missing");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.resolve(appRoot, relativePath);
    if (!fs.existsSync(absolutePath)) failures.push(`protected challenge file is missing: ${relativePath}`);
    else if (sha256(absolutePath) !== expectedHash) failures.push(`protected challenge file was changed: ${relativePath}`);
  }
}

function checkNoPlaceholders(relativePath, content) {
  for (const pattern of [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:name|model|enabled|permission|version|observed|replace|describe|explain)[^\]]*\]/i,
  ]) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

verifyStarterIntegrity();

const evidencePaths = [
  "graphify-out/graph.json",
  "graphify-out/graph.html",
  "graphify-out/GRAPH_REPORT.md",
  "evidence/graph-queries.md",
  "evidence/graph-audit.md",
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (failures.some((failure) => failure.startsWith("missing required evidence"))) {
  console.error("Graph verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "graphify-out/GRAPH_REPORT.md",
  "evidence/graph-queries.md",
  "evidence/graph-audit.md",
  "evidence/before.md",
  "evidence/after.md",
  "evidence/comparison.md",
]) {
  checkNoPlaceholders(relativePath, evidence[relativePath]);
}

let graph;
try {
  graph = JSON.parse(evidence["graphify-out/graph.json"]);
} catch {
  failures.push("graphify-out/graph.json is not valid JSON");
}

if (graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const links = Array.isArray(graph.links) ? graph.links : [];
  if (nodes.length < 25) failures.push(`graph.json contains too few nodes (${nodes.length})`);
  if (links.length < 20) failures.push(`graph.json contains too few links (${links.length})`);
  const graphText = JSON.stringify(graph).toLowerCase().replaceAll("\\", "/");
  for (const source of [
    "recognizedrevenue.ts",
    "tenantaccountdirectory.ts",
    "revenuesummary.ts",
    "loadrevenuedashboard.ts",
    "publishrevenuesnapshot.ts",
    "current-metric-contract.md",
    "service-ownership.md",
  ]) {
    if (!graphText.includes(source)) failures.push(`graph.json does not include ${source}`);
  }
  const confidenceText = links.map((link) => String(link.confidence ?? "").toUpperCase()).join(" ");
  if (!confidenceText.includes("EXTRACTED")) failures.push("graph.json has no EXTRACTED edge confidence");
}

const graphHtml = evidence["graphify-out/graph.html"];
if (graphHtml.length < 1000 || !/<html|<!doctype html/i.test(graphHtml)) {
  failures.push("graphify-out/graph.html is not a genuine graph visualization");
}

const graphReport = evidence["graphify-out/GRAPH_REPORT.md"];
if (graphReport.length < 300 || !/graph|node|communit/i.test(graphReport)) {
  failures.push("GRAPH_REPORT.md is too small or does not describe the generated graph");
}

const before = evidence["evidence/before.md"];
const after = evidence["evidence/after.md"];
for (const name of ["Agent", "Model", "Tools", "Permissions", "Time limit", "Prompt", "Attempt"]) {
  const beforeValue = field(before, name);
  const afterValue = field(after, name);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${name}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after implementation conditions differ for ${name}`);
  }
}
if (field(before, "Prompt") !== incidentPrompt || field(after, "Prompt") !== incidentPrompt) {
  failures.push("before.md and after.md must record the exact incident request");
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") {
  failures.push("both implementation sessions must be recorded as first attempts");
}
if (!/(?:normal|repository).{0,30}(?:search|inspection)/i.test(field(before, "Context source"))) {
  failures.push("before.md must identify normal repository search as its context source");
}
if (!/graph/i.test(field(after, "Context source"))) {
  failures.push("after.md must identify the Graphify graph as its context source");
}
if (!/disabled/i.test(field(before, "Graphify")) || !/enabled/i.test(field(after, "Graphify"))) {
  failures.push("before.md and after.md must record the Graphify boundary");
}

for (const [name, patch] of [
  ["before.patch", evidence["evidence/before.patch"]],
  ["after.patch", evidence["evidence/after.patch"]],
]) {
  if (!patch.includes("diff --git") || !patch.includes("@@") || patch.length < 300) {
    failures.push(`evidence/${name} must contain a genuine implementation patch`);
  }
  if (!patch.includes("recognizedRevenue.ts")) failures.push(`evidence/${name} must include the recognized-revenue change`);
}
if (evidence["evidence/before.patch"] === evidence["evidence/after.patch"]) {
  failures.push("before.patch and after.patch must show different implementations");
}

const queries = evidence["evidence/graph-queries.md"];
for (const question of ["GQ-01", "GQ-02", "GQ-03", "GQ-04", "GQ-05", "GQ-06"]) {
  if (!queries.includes(question)) failures.push(`graph-queries.md is missing ${question}`);
}
for (const command of ["graphify query", "graphify path", "graphify explain"]) {
  if (!queries.toLowerCase().includes(command)) failures.push(`graph-queries.md is missing ${command}`);
}
for (const concept of [
  "recognizedRevenueByAccount",
  "resolveBillingAccountId",
  "loadRevenueDashboard",
  "publishRevenueSnapshot",
  "current-metric-contract.md",
  "Billing Platform",
  "grossVolumeByAccount",
]) {
  if (!queries.toLowerCase().includes(concept.toLowerCase())) failures.push(`graph-queries.md is missing ${concept}`);
}
if (!/(?:inferred|ambiguous).{0,160}source verified|source verified.{0,160}(?:inferred|ambiguous)/is.test(queries)) {
  failures.push("graph-queries.md must source-verify an INFERRED or AMBIGUOUS edge");
}

const audit = evidence["evidence/graph-audit.md"];
for (const required of [
  "current sources retained",
  "stale or unsupported claims excluded",
  "graph-first boundary",
  "current-metric-contract.md",
  "legacy-finance-metrics.md",
  "graph-extract.md",
  "previous-agent-progress.md",
  "service-ownership.md",
]) {
  if (!audit.toLowerCase().includes(required.toLowerCase())) failures.push(`graph-audit.md is missing ${required}`);
}
if (!/quer(?:y|ied).{0,30}graph.{0,50}before.{0,40}(?:opening|reading|inspecting).{0,20}source/is.test(audit)) {
  failures.push("graph-audit.md must confirm that graph queries preceded source inspection");
}

const comparison = evidence["evidence/comparison.md"];
for (const topic of ["fair", "first attempt", "files opened", "wrong files", "assumption", "question", "verification"]) {
  if (!comparison.toLowerCase().includes(topic)) failures.push(`comparison.md must discuss ${topic}`);
}
for (const command of ["npm run test:billing", "npm run test:graph", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`after.md must record ${command}`);
}

if (failures.length) {
  console.error("Graph verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Graph verification passed: ${graph.nodes.length} nodes, ${graph.links.length} links, comparable first attempts, complete queries, audit, and patches.`);
