import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const [repositoryPath, notesPath] = process.argv.slice(2);
if (!repositoryPath || !notesPath) {
  throw new Error("Usage: npm run release:verify -- <materialized-repo> <release-notes.md>");
}
const git = (...args) => execFileSync("git", ["-C", repositoryPath, ...args], { encoding: "utf8" }).trim();
const range = "exercise-base..origin/exercise-head";
const changedFiles = git("diff", "--name-only", range).split(/\r?\n/).filter(Boolean);
const commits = git("log", "--format=%H", range).split(/\r?\n/).filter(Boolean);
const notes = await readFile(path.resolve(notesPath), "utf8");
if (!changedFiles.length || !commits.length) throw new Error("Comparison range has no real changes");
if (!/breaking/i.test(notes)) throw new Error("Release notes must identify the breaking change");
if (!/missing evidence/i.test(notes)) throw new Error("Release notes must identify missing verification evidence");
const customerSection = notes.match(/## Customer-facing changes\s+([\s\S]*?)(?=\n## |$)/i)?.[1] ?? "";
const items = customerSection.split(/\n(?=### )/).filter((item) => /^### /i.test(item.trim()));
if (!items.length) throw new Error("At least one customer-facing ### item is required");
for (const item of items) {
  const trace = item.match(/^- Trace:\s*(.+)$/im)?.[1] ?? "";
  const validTrace = changedFiles.some((file) => trace.includes(file)) || commits.some((sha) => trace.includes(sha) || trace.includes(sha.slice(0, 7)));
  if (!validTrace) throw new Error(`Every customer-facing item needs a real - Trace: ${item.match(/^### .+$/m)?.[0] ?? "unnamed item"}`);
}
if (/src\/telemetry\.js|clean events/i.test(customerSection)) throw new Error("Internal-only telemetry work must not be published");
console.log(JSON.stringify({ range, changedFiles, commits, verifiedItems: items.length }, null, 2));
