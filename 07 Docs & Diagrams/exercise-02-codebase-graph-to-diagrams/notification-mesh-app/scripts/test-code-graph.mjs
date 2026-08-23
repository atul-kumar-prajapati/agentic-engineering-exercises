import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildCodeGraph, findSymbol } from "./code-graph.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "code-graph-"));
try {
  fs.mkdirSync(path.join(root, "src", "notification"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "notification", "helper.mjs"), "export function helper() { return true; }\n");
  fs.writeFileSync(path.join(root, "src", "notification", "entry.mjs"), "import { helper as check } from './helper.mjs';\nexport function entry() { return check(); }\n");
  const graph = buildCodeGraph(root, "a".repeat(40));
  const entry = findSymbol(graph, "entry");
  const helper = findSymbol(graph, "helper");
  const call = graph.edges.find((edge) => edge.kind === "calls" && edge.from === entry.id && edge.to === helper.id);
  assert.ok(call, "aliased imported call must be recorded");
  assert.deepEqual(call.source_lines, [2]);
  assert.ok(graph.edges.some((edge) => edge.kind === "imports"));

  execFileSync("git", ["init"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Graph Test"], { cwd: root });
  execFileSync("git", ["config", "user.email", "graph@example.test"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "fixture"], { cwd: root });
  const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const scratch = path.join(root, "scratch", "code-graph.json");
  const defaultArtifact = path.join(path.dirname(root), "artifacts", "code-graph.json");
  const defaultArtifactExisted = fs.existsSync(defaultArtifact);
  execFileSync(process.execPath, [fileURLToPath(new URL("./build-code-graph.mjs", import.meta.url)), "--source-sha", sourceSha, "--out", scratch], { cwd: root });
  assert.equal(JSON.parse(fs.readFileSync(scratch, "utf8")).source_sha, sourceSha);
  assert.equal(fs.existsSync(defaultArtifact), defaultArtifactExisted, "scratch build must not create the default committed artifact");
  console.log("code graph self-test passed");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
