import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseMermaid } from "./mermaid-parser.mjs";

const exerciseRoot = path.resolve(process.cwd(), "..");
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: process.cwd(), encoding: "utf8" }).trim();
const diagrams = [
  ["diagrams/payment-architecture.mmd", "flowchart-v2"],
  ["diagrams/webhook-reconciliation-state.mmd", "stateDiagram"],
  ["diagrams/payment-sequence.mmd", "sequence"],
  ["diagrams/payment-data.mmd", "er"],
];

console.log(`Source SHA: ${sourceSha}`);
for (const [relative, expected] of diagrams) {
  const result = await parseMermaid(fs.readFileSync(path.join(exerciseRoot, relative), "utf8"));
  if (result.diagramType !== expected) throw new Error(`${relative} parsed as ${result.diagramType}, expected ${expected}`);
  console.log(`PASS ${relative} parsed as ${result.diagramType}`);
}
