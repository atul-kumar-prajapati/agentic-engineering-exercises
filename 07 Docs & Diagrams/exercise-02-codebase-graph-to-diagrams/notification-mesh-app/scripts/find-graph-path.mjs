import fs from "node:fs";
import path from "node:path";
import { findSymbol } from "./code-graph.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const graphIndex = process.argv.indexOf("--graph");
const graphPath = graphIndex === -1 ? path.resolve(process.cwd(), "..", "artifacts", "code-graph.json") : path.resolve(process.cwd(), process.argv[graphIndex + 1]);
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const start = findSymbol(graph, argument("--from"));
const target = findSymbol(graph, argument("--to"));
const queue = [[start.id]];
const visited = new Set([start.id]);
let result = null;
while (queue.length) {
  const candidate = queue.shift();
  const tail = candidate.at(-1);
  if (tail === target.id) { result = candidate; break; }
  for (const edge of graph.edges.filter((item) => item.kind === "calls" && item.from === tail)) {
    if (!visited.has(edge.to)) { visited.add(edge.to); queue.push([...candidate, edge.to]); }
  }
}
if (!result) throw new Error(`No call path from ${start.name} to ${target.name}`);
console.log(`Source SHA: ${graph.source_sha}`);
console.log(`Path length: ${result.length - 1}`);
for (let index = 0; index < result.length; index += 1) {
  const node = graph.nodes.find((item) => item.id === result[index]);
  console.log(`${index + 1}. ${node.name} (${node.path}:${node.line})`);
}
console.log("PASS direct call path reaches the durable queue result");
