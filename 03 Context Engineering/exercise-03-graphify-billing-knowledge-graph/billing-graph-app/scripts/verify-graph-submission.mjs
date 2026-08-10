import fs from "node:fs";
import path from "node:path";

const exerciseRoot = path.resolve(process.cwd(), "..");
const failures = [];
const required = [
  "graphify-out/graph.json",
  "graphify-out/GRAPH_REPORT.md",
  "evidence/graph-queries.md",
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
];
const values = {};
for (const relative of required) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
  } else {
    values[relative] = fs.readFileSync(absolute, "utf8");
    if (!values[relative].trim()) failures.push(`${relative} is empty`);
  }
}
if (values["graphify-out/graph.json"]) {
  try {
    const graph = JSON.parse(values["graphify-out/graph.json"]);
    if (JSON.stringify(graph).length < 1000) failures.push("graph.json is too small to represent the project");
  } catch {
    failures.push("graph.json is not valid JSON");
  }
}
const queries = values["evidence/graph-queries.md"].toLowerCase();
for (const term of ["graphify query", "graphify path", "graphify explain", "recognizedrevenue", "tenant", "owner", "source verified"]) {
  if (!queries.includes(term.toLowerCase())) failures.push(`graph-queries.md is missing ${term}`);
}
for (const patch of ["evidence/before.patch", "evidence/after.patch"]) {
  if (!values[patch].includes("diff --git") || !values[patch].includes("recognizedRevenue.ts")) failures.push(`${patch} is not a genuine billing patch`);
}
if (values["evidence/before.patch"] === values["evidence/after.patch"]) failures.push("before and after patches must differ");
const comparison = values["evidence/comparison.md"].toLowerCase();
for (const term of ["same agent", "first attempt", "files", "assumption", "graph", "verification"]) {
  if (!comparison.includes(term)) failures.push(`comparison.md is missing ${term}`);
}
if (failures.length) {
  console.error("Graph submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Graph artifacts, scoped queries, comparison, and patches are present.");
