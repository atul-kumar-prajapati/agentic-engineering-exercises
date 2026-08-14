import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildCodeGraph, normalizedGraph } from "./code-graph.mjs";
import { parseMermaid } from "./mermaid-parser.mjs";

const DIAGRAMS = {
  dependency: { path: "diagrams/notification-dependencies.mmd", type: "flowchart-v2" },
  sequence: { path: "diagrams/fallback-sequence.mmd", type: "sequence" },
};

const REQUIRED = {
  "DEP-01": { caller: "selectNotificationRoute", callee: "pushAvailable" },
  "DEP-02": { caller: "selectNotificationRoute", callee: "smsAvailable" },
  "DEP-03": { caller: "selectNotificationRoute", callee: "hasSmsConsent" },
  "DEP-04": { caller: "selectNotificationRoute", callee: "emailAvailable" },
  "DEP-05": { caller: "selectNotificationRoute", callee: "immediateRoute" },
  "DEP-06": { caller: "selectNotificationRoute", callee: "durableQueueRoute" },
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

function inside(root, relative, failures, label) {
  if (typeof relative !== "string" || !relative) { failures.push(`${label} path is missing`); return null; }
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) { failures.push(`${label} path escapes the exercise`); return null; }
  return absolute;
}

function graphFunction(graph, name) {
  return graph.nodes.filter((node) => node.kind === "function" && node.name === name);
}

function callEdge(graph, caller, callee) {
  const callers = graphFunction(graph, caller);
  const callees = graphFunction(graph, callee);
  if (callers.length !== 1 || callees.length !== 1) return [];
  return graph.edges.filter((edge) => edge.kind === "calls" && edge.from === callers[0].id && edge.to === callees[0].id);
}

function markerCount(source, id) {
  return source.match(new RegExp(`%%\\s*EDGE:\\s*${id}\\b`, "g"))?.length ?? 0;
}

async function verifyDiagrams(exerciseRoot, failures) {
  const sources = {};
  for (const [name, spec] of Object.entries(DIAGRAMS)) {
    const file = path.join(exerciseRoot, spec.path);
    if (!fs.existsSync(file)) { failures.push(`missing ${spec.path}`); continue; }
    const source = fs.readFileSync(file, "utf8");
    sources[name] = source;
    try {
      const result = await parseMermaid(source);
      if (result.diagramType !== spec.type) failures.push(`${spec.path} must parse as ${spec.type}`);
    } catch (error) { failures.push(`${spec.path} does not parse: ${error.message}`); }
    for (const id of Object.keys(REQUIRED)) if (markerCount(source, id) !== 1) failures.push(`${spec.path} must contain one %% EDGE: ${id} marker`);
  }
  const dependency = sources.dependency ?? "";
  for (const term of ["ChannelRouter", "ProviderStatus", "ConsentPolicy", "ImmediateRoute", "DurableQueue"]) if (!dependency.includes(term)) failures.push(`dependency diagram is missing ${term}`);
  const declared = [...dependency.matchAll(/^\s*(\w+)\s*-->\s*(\w+)\s*$/gm)].map((match) => `${match[1]}->${match[2]}`);
  const allowed = new Set(["ChannelRouter->ProviderStatus", "ChannelRouter->ConsentPolicy", "ChannelRouter->ImmediateRoute", "ChannelRouter->DurableQueue"]);
  for (const relation of declared) if (!allowed.has(relation)) failures.push(`dependency diagram contains unsupported relationship ${relation}`);
  for (const relation of allowed) if (!declared.includes(relation)) failures.push(`dependency diagram is missing ${relation}`);
  const sequence = sources.sequence ?? "";
  for (const actor of ["Client", "ChannelRouter", "ProviderStatus", "ConsentPolicy", "RouteResult"]) if (!new RegExp(`(?:participant|actor)\\s+${actor}\\b`).test(sequence)) failures.push(`sequence diagram is missing ${actor}`);
  for (const term of ["sms not consented", "email selected", "email unavailable", "durable queue selected"]) if (!sequence.toLowerCase().includes(term)) failures.push(`sequence diagram is missing ${term}`);
}

function verifyTrace(repositoryRoot, appRoot, graph, trace, failures) {
  if (trace?.schema_version !== 1) failures.push("traceability schema_version must be 1");
  if (!/^[a-f0-9]{40}$/i.test(trace?.source_sha ?? "")) { failures.push("traceability source_sha is invalid"); return; }
  if (trace.source_sha !== graph.source_sha) failures.push("traceability and graph source_sha differ");
  const entries = Array.isArray(trace?.edges) ? trace.edges : [];
  if (entries.length !== 6) failures.push("traceability must contain exactly six edges");
  for (const [id, expected] of Object.entries(REQUIRED)) {
    const matches = entries.filter((entry) => entry.id === id);
    if (matches.length !== 1) { failures.push(`traceability must contain one ${id}`); continue; }
    const entry = matches[0];
    if (entry.caller !== expected.caller || entry.callee !== expected.callee) failures.push(`${id} caller or callee is incorrect`);
    const graphMatches = callEdge(graph, expected.caller, expected.callee);
    if (graphMatches.length !== 1) { failures.push(`generated graph must contain one ${expected.caller} -> ${expected.callee} call`); continue; }
    const edge = graphMatches[0];
    if (entry.graph_edge_id !== edge.id || entry.source_path !== edge.source_path || JSON.stringify(entry.source_lines) !== JSON.stringify(edge.source_lines)) failures.push(`${id} does not match its generated graph edge`);
    if (!Array.isArray(entry.diagram_paths) || entry.diagram_paths.length !== 2 || !Object.values(DIAGRAMS).every((spec) => entry.diagram_paths.includes(spec.path))) failures.push(`${id} must map to both diagrams`);
    try {
      const source = git(repositoryRoot, ["show", `${trace.source_sha}:${path.relative(repositoryRoot, path.join(appRoot, edge.source_path)).split(path.sep).join("/")}`]);
      const sourceLines = source.split(/\r?\n/);
      const excerpts = edge.source_lines.map((line) => sourceLines[line - 1]?.trim());
      if (!Array.isArray(entry.source_excerpts) || JSON.stringify(excerpts) !== JSON.stringify(entry.source_excerpts.map((item) => item.trim()))) failures.push(`${id} source excerpts do not match source_sha`);
      if (excerpts.some((line) => !line?.includes(`${expected.callee}(`))) failures.push(`${id} source lines do not call ${expected.callee}`);
    } catch { failures.push(`${id} source_sha or source path cannot be read`); }
  }
}

function verifyStaleClaims(file, failures) {
  if (!fs.existsSync(file)) { failures.push("missing evidence/stale-claims.md"); return; }
  const source = fs.readFileSync(file, "utf8");
  for (let index = 1; index <= 6; index += 1) {
    const id = `STALE-${String(index).padStart(2, "0")}`;
    const start = source.search(new RegExp(`^##\\s+${id}\\b`, "m"));
    if (start === -1) { failures.push(`stale-claims.md is missing ${id}`); continue; }
    const next = source.indexOf("\n## ", start + 1);
    const section = source.slice(start, next === -1 ? undefined : next);
    if (!/Result:\s*(supported|rejected)/i.test(section)) failures.push(`${id} is missing Result: supported or Result: rejected`);
    if (!/(graph edge|source:)/i.test(section)) failures.push(`${id} is missing graph or source evidence`);
    if (section.trim().length < 100) failures.push(`${id} needs a concise evidence-based explanation`);
  }
}

function verifyArtifact(exerciseRoot, record, expectedPath, failures, label) {
  if (!record || record.path !== expectedPath) { failures.push(`${label} path must be ${expectedPath}`); return; }
  const file = inside(exerciseRoot, record.path, failures, label);
  if (!file || !fs.existsSync(file)) { failures.push(`missing ${expectedPath}`); return; }
  if (!/^[a-f0-9]{64}$/.test(record.sha256 ?? "") || hash(file) !== record.sha256) failures.push(`${label} SHA-256 does not match`);
}

function verifyCommand(exerciseRoot, record, expected, sourceSha, failures, label) {
  if (!record || record.command !== expected.command || record.exit_code !== 0 || record.output_path !== expected.output) { failures.push(`${label} command record is incorrect`); return; }
  const output = inside(exerciseRoot, record.output_path, failures, label);
  if (!output || !fs.existsSync(output)) { failures.push(`missing ${expected.output}`); return; }
  if (!/^[a-f0-9]{64}$/.test(record.output_sha256 ?? "") || hash(output) !== record.output_sha256) failures.push(`${label} output SHA-256 does not match`);
  const text = fs.readFileSync(output, "utf8");
  if (!text.includes(sourceSha) || !/PASS/.test(text)) failures.push(`${label} output must contain the source SHA and PASS`);
}

export async function verifyGraphSubmission({ repositoryRoot, appRoot, exerciseRoot }) {
  const failures = [];
  const graphPath = path.join(exerciseRoot, "artifacts", "code-graph.json");
  const graph = readJson(graphPath, failures, "artifacts/code-graph.json");
  const trace = readJson(path.join(exerciseRoot, "evidence", "traceability.json"), failures, "evidence/traceability.json");
  const manifest = readJson(path.join(exerciseRoot, "evidence", "graph-manifest.json"), failures, "evidence/graph-manifest.json");
  await verifyDiagrams(exerciseRoot, failures);
  if (graph) {
    if (graph.schema_version !== 1 || !/^[a-f0-9]{40}$/i.test(graph.source_sha ?? "")) failures.push("graph schema_version or source_sha is invalid");
    const regenerated = buildCodeGraph(appRoot, graph.source_sha);
    if (JSON.stringify(normalizedGraph(graph)) !== JSON.stringify(normalizedGraph(regenerated))) failures.push("artifacts/code-graph.json does not match current notification source");
    for (const expected of Object.values(REQUIRED)) if (callEdge(graph, expected.caller, expected.callee).length !== 1) failures.push(`graph is missing ${expected.caller} -> ${expected.callee}`);
    if (trace) verifyTrace(repositoryRoot, appRoot, graph, trace, failures);
  }
  verifyStaleClaims(path.join(exerciseRoot, "evidence", "stale-claims.md"), failures);
  if (manifest) {
    const sourceSha = graph?.source_sha ?? "";
    if (manifest.schema_version !== 1 || manifest.source_sha !== sourceSha) failures.push("manifest schema_version or source_sha is incorrect");
    verifyArtifact(exerciseRoot, manifest.graph, "artifacts/code-graph.json", failures, "graph artifact");
    verifyArtifact(exerciseRoot, manifest.diagrams?.dependency, DIAGRAMS.dependency.path, failures, "dependency diagram");
    verifyArtifact(exerciseRoot, manifest.diagrams?.sequence, DIAGRAMS.sequence.path, failures, "sequence diagram");
    verifyArtifact(exerciseRoot, manifest.evidence?.traceability, "evidence/traceability.json", failures, "traceability artifact");
    verifyArtifact(exerciseRoot, manifest.evidence?.stale_claims, "evidence/stale-claims.md", failures, "stale claims artifact");
    verifyCommand(exerciseRoot, manifest.commands?.graph_build, { command: "npm run graph:build", output: "evidence/commands/graph-build.txt" }, sourceSha, failures, "graph build");
    verifyCommand(exerciseRoot, manifest.commands?.graph_query, { command: "npm run graph:query -- --symbol selectNotificationRoute", output: "evidence/commands/graph-query.txt" }, sourceSha, failures, "graph query");
    verifyCommand(exerciseRoot, manifest.commands?.graph_path, { command: "npm run graph:path -- --from selectNotificationRoute --to durableQueueRoute", output: "evidence/commands/graph-path.txt" }, sourceSha, failures, "graph path");
    try {
      const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
      git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
      const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
      const prefix = `${path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/")}/`;
      const allowed = [`${prefix}artifacts/`, `${prefix}evidence/`];
      for (const file of changed) if (!allowed.some((item) => file.startsWith(item))) failures.push(`commit after source_sha changes non-evidence file ${file}`);
    } catch { failures.push("source_sha must be an ancestor of HEAD"); }
  }
  const verification = path.join(exerciseRoot, "evidence", "verification.md");
  if (!fs.existsSync(verification)) failures.push("missing evidence/verification.md");
  else for (const term of ["source sha", "graph regeneration", "mermaid parser", "semantic edge", "routing test", "stale claim", "remaining uncertainty", "final conclusion"]) if (!fs.readFileSync(verification, "utf8").toLowerCase().includes(term)) failures.push(`verification.md is missing ${term}`);
  return [...new Set(failures)];
}
