import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildCodeGraph } from "./code-graph.mjs";
import { verifyGraphSubmission } from "./graph-verification.mjs";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
function write(root, relative, content) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return file; }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "graph-verifier-"));
try {
  const repositoryRoot = path.join(temporary, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "app");
  fs.mkdirSync(path.join(appRoot, "src", "notification"), { recursive: true });
  git(repositoryRoot, ["init"]); git(repositoryRoot, ["config", "core.autocrlf", "false"]); git(repositoryRoot, ["config", "user.name", "Verifier"]); git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);
  write(appRoot, "src/notification/providers.mjs", `export function pushAvailable(i) { return i.push; }\nexport function smsAvailable(i) { return i.sms; }\nexport function emailAvailable(i) { return i.email; }\n`);
  write(appRoot, "src/notification/consent.mjs", `export function hasSmsConsent(i) { return i.consent; }\n`);
  write(appRoot, "src/notification/results.mjs", `export function immediateRoute(c) { return { channel: c }; }\nexport function durableQueueRoute() { return { channel: "queue" }; }\n`);
  write(appRoot, "src/notification/routeNotification.mjs", `import { pushAvailable, smsAvailable, emailAvailable } from "./providers.mjs";\nimport { hasSmsConsent } from "./consent.mjs";\nimport { immediateRoute, durableQueueRoute } from "./results.mjs";\nexport function selectNotificationRoute(i) {\n if (pushAvailable(i)) return immediateRoute("push");\n if (smsAvailable(i) && hasSmsConsent(i)) return immediateRoute("sms");\n if (emailAvailable(i)) return immediateRoute("email");\n return durableQueueRoute();\n}\n`);
  const dep = write(exerciseRoot, "diagrams/notification-dependencies.mmd", `flowchart LR\nChannelRouter --> ProviderStatus\nChannelRouter --> ConsentPolicy\nChannelRouter --> ImmediateRoute\nChannelRouter --> DurableQueue\n`);
  const seq = write(exerciseRoot, "diagrams/fallback-sequence.mmd", `sequenceDiagram\nactor Client\nparticipant ChannelRouter\nparticipant ProviderStatus\nparticipant ConsentPolicy\nparticipant RouteResult\nClient->>ChannelRouter: route\n%% EDGE: DEP-01\nChannelRouter->>ProviderStatus: push unavailable\n%% EDGE: DEP-02\nChannelRouter->>ProviderStatus: sms available\n%% EDGE: DEP-03\nChannelRouter->>ConsentPolicy: sms not consented\n%% EDGE: DEP-04\nChannelRouter->>ProviderStatus: email available\n%% EDGE: DEP-05\nChannelRouter->>RouteResult: email selected\nClient->>ChannelRouter: route again\nChannelRouter->>ProviderStatus: email unavailable\n%% EDGE: DEP-06\nChannelRouter->>RouteResult: durable queue selected\n`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "source"]); const sourceSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
  const graphFile = write(exerciseRoot, "artifacts/code-graph.json", `${JSON.stringify(buildCodeGraph(appRoot, sourceSha), null, 2)}\n`);
  const graph = JSON.parse(fs.readFileSync(graphFile, "utf8"));
  const specs = { "DEP-01": "pushAvailable", "DEP-02": "smsAvailable", "DEP-03": "hasSmsConsent", "DEP-04": "emailAvailable", "DEP-05": "immediateRoute", "DEP-06": "durableQueueRoute" };
  const traceFile = write(exerciseRoot, "evidence/traceability.json", `${JSON.stringify({ schema_version: 1, source_sha: sourceSha, edges: Object.entries(specs).map(([id, callee]) => { const edge = graph.edges.find((item) => item.kind === "calls" && graph.nodes.find((node) => node.id === item.to)?.name === callee); const source = fs.readFileSync(path.join(appRoot, edge.source_path), "utf8").split(/\r?\n/); return { id, graph_edge_id: edge.id, caller: "selectNotificationRoute", callee, source_path: edge.source_path, source_lines: edge.source_lines, source_excerpts: edge.source_lines.map((line) => source[line - 1].trim()), diagram_paths: ["diagrams/notification-dependencies.mmd", "diagrams/fallback-sequence.mmd"] }; }) }, null, 2)}\n`);
  const stale = write(exerciseRoot, "evidence/stale-claims.md", `${[1,2,3,4,5,6].map((n) => `## STALE-0${n}\nResult: ${n < 3 ? "supported" : "rejected"}. Graph edge evidence and Source: src/notification/routeNotification.mjs show whether this relationship exists in the generated output and why the snapshot claim is accepted or rejected for the committed implementation.`).join("\n\n")}\n`);
  const outputs = {};
  for (const [key, name] of [["graph_build","graph-build"],["graph_query","graph-query"],["graph_path","graph-path"]]) outputs[key] = write(exerciseRoot, `evidence/commands/${name}.txt`, `Source SHA: ${sourceSha}\nPASS reproducible ${name} output with complete graph details for reviewer verification.\n`);
  const commands = {
    graph_build: { command: "npm run graph:build", exit_code: 0, output_path: "evidence/commands/graph-build.txt", output_sha256: hash(outputs.graph_build) },
    graph_query: { command: "npm run graph:query -- --symbol selectNotificationRoute", exit_code: 0, output_path: "evidence/commands/graph-query.txt", output_sha256: hash(outputs.graph_query) },
    graph_path: { command: "npm run graph:path -- --from selectNotificationRoute --to durableQueueRoute", exit_code: 0, output_path: "evidence/commands/graph-path.txt", output_sha256: hash(outputs.graph_path) },
  };
  write(exerciseRoot, "evidence/graph-manifest.json", `${JSON.stringify({ schema_version: 1, source_sha: sourceSha, graph: { path: "artifacts/code-graph.json", sha256: hash(graphFile) }, diagrams: { dependency: { path: "diagrams/notification-dependencies.mmd", sha256: hash(dep) }, sequence: { path: "diagrams/fallback-sequence.mmd", sha256: hash(seq) } }, evidence: { traceability: { path: "evidence/traceability.json", sha256: hash(traceFile) }, stale_claims: { path: "evidence/stale-claims.md", sha256: hash(stale) } }, commands }, null, 2)}\n`);
  write(exerciseRoot, "evidence/verification.md", `Source SHA ${sourceSha}. Graph regeneration passed. Mermaid parser passed. Semantic edge checks passed. Routing test passed. Stale claim review completed. Remaining uncertainty: none. Final conclusion: approved.\n`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "evidence"]);
  assert.deepEqual(await verifyGraphSubmission({ repositoryRoot, appRoot, exerciseRoot }), []);
  const originalSequence = fs.readFileSync(seq, "utf8");
  fs.writeFileSync(seq, originalSequence.replace("ChannelRouter->>ConsentPolicy: sms not consented", "ChannelRouter->>RouteResult: sms not consented"));
  assert.ok((await verifyGraphSubmission({ repositoryRoot, appRoot, exerciseRoot })).some((failure) => failure.includes("DEP-03 marker must immediately precede")));
  fs.writeFileSync(seq, originalSequence);
  const tampered = JSON.parse(fs.readFileSync(traceFile, "utf8")); tampered.edges[0].callee = "durableQueueRoute"; fs.writeFileSync(traceFile, JSON.stringify(tampered));
  assert.ok((await verifyGraphSubmission({ repositoryRoot, appRoot, exerciseRoot })).some((failure) => failure.includes("caller or callee")));
  console.log("code graph verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
