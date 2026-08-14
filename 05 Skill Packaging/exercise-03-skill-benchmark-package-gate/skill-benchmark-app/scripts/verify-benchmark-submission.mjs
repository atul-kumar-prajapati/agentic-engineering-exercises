import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { benchmarkMarkdown, buildBenchmark, collectWorkspace } from "./benchmark-lib.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
const evals = JSON.parse(fs.readFileSync(path.join(appRoot, "evals", "evals.json"), "utf8")).evals;

let collected;
try {
  collected = collectWorkspace({ appRoot, exerciseRoot, evals });
  failures.push(...collected.failures);
} catch (error) {
  failures.push(error.message);
}

let expectedBenchmark;
if (collected && !collected.failures.length) expectedBenchmark = buildBenchmark(collected, evals);
const benchmarkPath = path.join(evidenceRoot, "benchmark.json");
const benchmarkMdPath = path.join(evidenceRoot, "benchmark.md");
if (!fs.existsSync(benchmarkPath)) failures.push("missing evidence/benchmark.json");
else if (expectedBenchmark) {
  try {
    const submitted = JSON.parse(fs.readFileSync(benchmarkPath, "utf8"));
    if (JSON.stringify(submitted) !== JSON.stringify(expectedBenchmark)) failures.push("evidence/benchmark.json does not match the recomputed workspace benchmark");
  } catch {
    failures.push("evidence/benchmark.json is invalid JSON");
  }
}
if (!fs.existsSync(benchmarkMdPath)) failures.push("missing evidence/benchmark.md");
else if (expectedBenchmark && fs.readFileSync(benchmarkMdPath, "utf8") !== benchmarkMarkdown(expectedBenchmark)) failures.push("evidence/benchmark.md does not match the recomputed benchmark");
if (expectedBenchmark && !expectedBenchmark.gate.passed) {
  for (const check of expectedBenchmark.gate.checks.filter((item) => !item.passed)) failures.push(`benchmark gate failed: ${check.id}`);
}

function requireReport(name, terms) {
  const file = path.join(evidenceRoot, name);
  if (!fs.existsSync(file)) {
    failures.push(`missing evidence/${name}`);
    return "";
  }
  const text = fs.readFileSync(file, "utf8");
  const lower = text.toLowerCase();
  for (const term of terms) if (!lower.includes(term)) failures.push(`evidence/${name} is missing ${term}`);
  return text;
}

const skillRecord = requireReport("skill-record.md", ["source", "source commit", "installed path", "sha-256", "installation", "agent", "model", "permissions", "time limit", "repository commit"]);
if (skillRecord) {
  if (!/https:\/\/github\.com\/anthropics\/skills/i.test(skillRecord)) failures.push("evidence/skill-record.md must identify the skill-creator source repository");
  if (!/source commit[^a-f0-9]*[a-f0-9]{40}/i.test(skillRecord)) failures.push("evidence/skill-record.md must contain a 40-character source commit");
  if (!/sha-256[^a-f0-9]*[a-f0-9]{64}/i.test(skillRecord)) failures.push("evidence/skill-record.md must contain the installed SKILL.md SHA-256");
}
requireReport("analysis.md", ["training", "held-out", "critical", "variance", "token", "elapsed", "outlier", "adoption"]);

const skillCheck = spawnSync(process.execPath, [path.join(appRoot, "scripts", "validate-benchmark-skill.mjs")], { cwd: appRoot, encoding: "utf8" });
if (skillCheck.status !== 0) failures.push(`skill validation failed: ${(skillCheck.stderr || skillCheck.stdout).trim()}`);
const packageCheck = spawnSync("python", [path.join(appRoot, "scripts", "verify-skill-package.py")], { cwd: appRoot, encoding: "utf8" });
if (packageCheck.status !== 0) failures.push(`package verification failed: ${(packageCheck.stderr || packageCheck.stdout).trim()}`);

if (failures.length) {
  console.error("Benchmark submission verification failed:\n" + [...new Set(failures)].map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("All 36 runs were regraded, the benchmark gate passed, and the archive exactly matches the evaluated skill.");
