import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { routeTask } from "../src/routing/routeTask.mjs";
import { buildRoutingScorecard, verifyRoutingHistory } from "./routing-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function json(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const cases = json(path.join(exerciseRoot, "evals", "routing-cases.json"), "cases") ?? [];
const pricing = json(path.join(exerciseRoot, "evals", "pricing.json"), "pricing") ?? {};
const packPath = path.join(exerciseRoot, "evals", "recorded-runs.json");
const packText = fs.readFileSync(packPath, "utf8");
const pack = JSON.parse(packText);
const metadata = json(path.join(evidenceRoot, "measurement-run.json"), "measurement metadata");
const built = buildRoutingScorecard({
  cases, pricing, pack, packText,
  measurements: json(path.join(evidenceRoot, "routing-measurements.json"), "routing measurements") ?? [],
  metadata,
  decisions: cases.map((item) => ({ id: item.id, route: routeTask(item) })),
});
failures.push(...built.failures);
const stored = json(path.join(evidenceRoot, "cost-model.json"), "generated cost model");
if (stored && JSON.stringify(stored) !== JSON.stringify(built.scorecard)) failures.push("cost-model.json does not match protected runs and submitted measurements");
if (built.scorecard.adoption !== "adopt") failures.push("not every routing adoption gate passes");
for (const [file, terms] of [
  ["routing-policy.md", ["precedence", "tie-break", "fast", "balanced", "reasoning", "clarify", "single retry", "field"]],
  ["adoption.md", ["quality", "safety", "cost", "latency", "variance", "benchmark", "held-out", "adopt", `${built.scorecard.totals.savingsPercent}`]],
]) {
  const text = fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8").toLowerCase() : "";
  for (const term of terms) if (!text.includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
}
if (metadata?.sourceSha) failures.push(...verifyRoutingHistory({ repositoryRoot, exerciseRoot, sourceSha: metadata.sourceSha }));
if (failures.length) {
  console.error(`Routing submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${metadata.sourceSha}`);
console.log("PASS 36 protected offline measurements and response hashes verified");
console.log("PASS selected-route quality, safety, latency, and variance recomputed");
console.log("PASS single-retry escalation costs reconcile to protected tokens and pricing");
console.log("PASS policy savings beat the all-reasoning baseline threshold");
console.log("PASS focused router source and evidence-only history verified without an API key");
