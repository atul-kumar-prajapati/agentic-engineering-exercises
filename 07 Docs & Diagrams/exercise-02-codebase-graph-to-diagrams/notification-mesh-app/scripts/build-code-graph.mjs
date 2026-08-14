import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildCodeGraph } from "./code-graph.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const outputIndex = process.argv.indexOf("--out");
const output = outputIndex === -1 ? path.join(exerciseRoot, "artifacts", "code-graph.json") : path.resolve(appRoot, process.argv[outputIndex + 1]);
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
const graph = buildCodeGraph(appRoot, sourceSha);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(graph, null, 2)}\n`);
console.log(`Source SHA: ${sourceSha}`);
console.log(`Graph: ${path.relative(exerciseRoot, output).split(path.sep).join("/")}`);
console.log(`Nodes: ${graph.nodes.length}`);
console.log(`Edges: ${graph.edges.length}`);
console.log("PASS generated graph directly from notification source");
