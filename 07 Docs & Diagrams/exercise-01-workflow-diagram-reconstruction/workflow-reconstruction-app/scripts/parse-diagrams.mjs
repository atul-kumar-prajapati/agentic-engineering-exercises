import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseMermaid } from "./mermaid-parser.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
const diagrams = [
  ["diagrams/access-state.mmd", "stateDiagram"],
  ["diagrams/access-approval-sequence.mmd", "sequence"],
  ["diagrams/access-failure-sequence.mmd", "sequence"],
];

console.log(`Source SHA: ${sourceSha}`);
for (const [relative, expectedType] of diagrams) {
  const source = fs.readFileSync(path.join(exerciseRoot, relative), "utf8");
  const result = await parseMermaid(source);
  if (result.diagramType !== expectedType) throw new Error(`${relative} parsed as ${result.diagramType}, expected ${expectedType}`);
  console.log(`PASS: ${relative} parsed as ${result.diagramType}`);
}
console.log("PASS: all three Mermaid diagrams parsed successfully.");
