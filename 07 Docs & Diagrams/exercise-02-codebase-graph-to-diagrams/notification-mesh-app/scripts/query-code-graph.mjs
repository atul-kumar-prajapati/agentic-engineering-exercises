import fs from "node:fs";
import path from "node:path";
import { findSymbol } from "./code-graph.mjs";

const index = process.argv.indexOf("--symbol");
if (index === -1 || !process.argv[index + 1]) throw new Error("Usage: npm run graph:query -- --symbol <function>");
const graphIndex = process.argv.indexOf("--graph");
const graphPath = graphIndex === -1 ? path.resolve(process.cwd(), "..", "artifacts", "code-graph.json") : path.resolve(process.cwd(), process.argv[graphIndex + 1]);
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const node = findSymbol(graph, process.argv[index + 1]);
const incoming = graph.edges.filter((edge) => edge.to === node.id);
const outgoing = graph.edges.filter((edge) => edge.from === node.id);
console.log(`Source SHA: ${graph.source_sha}`);
console.log(`Node: ${node.id} (${node.path}:${node.line})`);
console.log(`Incoming: ${incoming.length}`);
for (const edge of incoming) console.log(`  ${edge.id} ${edge.from} -> ${edge.to} at ${edge.source_path}:${edge.source_lines.join(",")}`);
console.log(`Outgoing: ${outgoing.length}`);
for (const edge of outgoing) console.log(`  ${edge.id} ${edge.from} -> ${edge.to} at ${edge.source_path}:${edge.source_lines.join(",")}`);
console.log("PASS scoped graph query completed");
