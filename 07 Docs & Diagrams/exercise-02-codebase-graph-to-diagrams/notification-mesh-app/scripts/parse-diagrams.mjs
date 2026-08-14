import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseMermaid } from "./mermaid-parser.mjs";

const exerciseRoot = path.resolve(process.cwd(), "..");
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: process.cwd(), encoding: "utf8" }).trim();
const diagrams = [
  ["diagrams/notification-dependencies.mmd", "flowchart-v2"],
  ["diagrams/fallback-sequence.mmd", "sequence"],
];
console.log(`Source SHA: ${sourceSha}`);
for (const [relative, expected] of diagrams) {
  const parsed = await parseMermaid(fs.readFileSync(path.join(exerciseRoot, relative), "utf8"));
  if (parsed.diagramType !== expected) throw new Error(`${relative} parsed as ${parsed.diagramType}, expected ${expected}`);
  console.log(`PASS ${relative} parsed as ${parsed.diagramType}`);
}
