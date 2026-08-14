import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
  console.log("code graph self-test passed");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
