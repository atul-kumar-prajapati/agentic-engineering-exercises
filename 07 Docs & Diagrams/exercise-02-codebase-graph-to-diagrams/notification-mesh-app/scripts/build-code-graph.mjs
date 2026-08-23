import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildCodeGraph } from "./code-graph.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const outputIndex = process.argv.indexOf("--out");
const output = outputIndex === -1 ? path.join(exerciseRoot, "artifacts", "code-graph.json") : path.resolve(appRoot, process.argv[outputIndex + 1]);
const sourceIndex = process.argv.indexOf("--source-sha");
const sourceSha = sourceIndex === -1
  ? execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim()
  : process.argv[sourceIndex + 1];
if (!/^[a-f0-9]{40}$/i.test(sourceSha ?? "")) throw new Error("--source-sha must be a full 40-character Git SHA");
execFileSync("git", ["merge-base", "--is-ancestor", sourceSha, "HEAD"], { cwd: appRoot });
const changedSource = execFileSync("git", ["diff", "--name-only", sourceSha, "HEAD", "--", "src/notification"], { cwd: appRoot, encoding: "utf8" }).trim();
if (changedSource) throw new Error(`Notification source changed after ${sourceSha}: ${changedSource}`);
const graph = buildCodeGraph(appRoot, sourceSha);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(graph, null, 2)}\n`);
console.log(`Source SHA: ${sourceSha}`);
console.log(`Graph: ${path.relative(exerciseRoot, output).split(path.sep).join("/")}`);
console.log(`Nodes: ${graph.nodes.length}`);
console.log(`Edges: ${graph.edges.length}`);
console.log("PASS generated graph directly from notification source");
