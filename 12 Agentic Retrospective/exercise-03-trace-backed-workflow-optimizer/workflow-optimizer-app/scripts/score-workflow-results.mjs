import fs from "node:fs";
import path from "node:path";
import { computeBenchmark, responseSha256 } from "./workflow-grading.mjs";

const root = path.resolve(import.meta.dirname, "..");
const evidence = path.resolve(root, "..", "evidence");
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals/replay-cases.json"), "utf8"));
const baseline = JSON.parse(fs.readFileSync(path.join(evidence, "baseline-runs.json"), "utf8"));
const candidate = JSON.parse(fs.readFileSync(path.join(evidence, "candidate-runs.json"), "utf8"));
for (const [lane, runs] of [["baseline", baseline], ["candidate", candidate]]) {
  for (const run of runs) {
    if (run.lane !== lane) throw new Error(`${run.caseId}/${run.run} has incorrect lane`);
    if (run.responseSha256 !== responseSha256(run.response)) throw new Error(`${run.caseId}/${lane}/${run.run} response hash mismatch`);
  }
}
const benchmark = computeBenchmark(cases, baseline, candidate);
if (process.argv.includes("--write")) fs.writeFileSync(path.join(evidence, "benchmark.json"), `${JSON.stringify(benchmark, null, 2)}\n`);
else console.log(JSON.stringify(benchmark, null, 2));
if (!benchmark.adopt) process.exitCode = 1;
