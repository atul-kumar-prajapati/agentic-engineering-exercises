import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { normalizedGraph } from "./code-graph.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const committedPath = path.join(exerciseRoot, "artifacts", "code-graph.json");

if (!fs.existsSync(committedPath)) throw new Error("Missing artifacts/code-graph.json. Generate and commit the graph before final verification.");
const committedSource = fs.readFileSync(committedPath, "utf8");
const committedGraph = JSON.parse(committedSource);
if (!/^[a-f0-9]{40}$/i.test(committedGraph.source_sha ?? "")) throw new Error("Committed graph has an invalid source_sha.");

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "notification-graph-check-"));
try {
  const scratchPath = path.join(temporaryRoot, "code-graph.json");
  execFileSync(process.execPath, [
    path.join(appRoot, "scripts", "build-code-graph.mjs"),
    "--source-sha",
    committedGraph.source_sha,
    "--out",
    scratchPath,
  ], { cwd: appRoot, stdio: "inherit" });
  const regenerated = JSON.parse(fs.readFileSync(scratchPath, "utf8"));
  assert.deepEqual(normalizedGraph(regenerated), normalizedGraph(committedGraph), "Committed graph differs from a scratch rebuild at source_sha.");
  assert.equal(fs.readFileSync(committedPath, "utf8"), committedSource, "Scratch rebuild changed the committed graph artifact.");
  console.log("PASS scratch graph rebuild matches the committed artifact without rewriting it");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
