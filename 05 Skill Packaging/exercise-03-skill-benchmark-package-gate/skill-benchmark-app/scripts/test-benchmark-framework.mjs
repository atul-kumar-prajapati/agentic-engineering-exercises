import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildBenchmark, collectWorkspace, gradeOutput, skillManifest } from "./benchmark-lib.mjs";

const evals = JSON.parse(fs.readFileSync("evals/evals.json", "utf8")).evals;
const output = `# Incident Summary

## Timeline
Detection occurred at 03:14 [EVT-C1]. Recovery was confirmed at 03:49 [EVT-C6].

## Impact
12,400 requests were delayed [IMP-C4].

## Cause and uncertainty
Cache saturation was verified [OBS-C2]. The deployment link remains a hypothesis [HYP-C3].

## Resolution
The cache pool was expanded [REM-C5].

## Follow-up actions
Platform owns the open reproduction action [ACT-C2].`;
const grading = gradeOutput(evals.find((item) => item.id === 3), output);
assert.equal(grading.summary.pass_rate, 1);
assert.equal(grading.expectations.length, 5);
const failing = gradeOutput(evals.find((item) => item.id === 3), "A short unsupported summary.");
assert.equal(failing.summary.pass_rate, 0);
const starter = skillManifest("fixtures/incident-summary-starter");
assert.equal(starter.files.length, 1);
assert.match(starter.tree_sha256, /^[a-f0-9]{64}$/);

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "skill-benchmark-self-test-"));
try {
  const exerciseRoot = temporaryRoot;
  const appRoot = path.join(exerciseRoot, "app");
  const skillText = fs.readFileSync("fixtures/incident-summary-starter/SKILL.md", "utf8");
  for (const skillPath of [path.join(appRoot, "fixtures", "incident-summary-starter"), path.join(appRoot, "skills", "incident-summary")]) {
    fs.mkdirSync(skillPath, { recursive: true });
    fs.writeFileSync(path.join(skillPath, "SKILL.md"), skillText);
  }
  const hashes = {
    without_skill: null,
    starter_skill: skillManifest(path.join(appRoot, "fixtures", "incident-summary-starter")).tree_sha256,
    with_skill: skillManifest(path.join(appRoot, "skills", "incident-summary")).tree_sha256,
  };
  for (const evalDefinition of evals) {
    const required = evalDefinition.expectations.flatMap((expectation) => expectation.checks.flatMap((check) => {
      if (check.type === "contains_all") return check.values;
      if (check.type === "contains_any") return check.values.slice(0, 1);
      return [];
    }));
    const passingOutput = `# Incident Summary\n\n${required.join("\n")}\n\n${"Verified report detail. ".repeat(15)}`;
    const failingOutput = `# Unsupported summary\n\n${"No source-backed details were recorded. ".repeat(10)}`;
    for (const configuration of ["without_skill", "starter_skill", "with_skill"]) {
      for (let runNumber = 1; runNumber <= 3; runNumber += 1) {
        const runRoot = path.join(exerciseRoot, "benchmark-workspace", `eval-${evalDefinition.id}`, configuration, `run-${runNumber}`);
        const outputPath = path.join(runRoot, "outputs", "incident-summary.md");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        const runOutput = configuration === "with_skill" ? passingOutput : failingOutput;
        fs.writeFileSync(outputPath, runOutput);
        fs.writeFileSync(path.join(runRoot, "grading.json"), JSON.stringify(gradeOutput(evalDefinition, runOutput)));
        const durationMs = configuration === "with_skill" ? 12000 : 10000;
        const timing = {
          eval_id: evalDefinition.id,
          configuration,
          run_number: runNumber,
          agent: "framework-self-test",
          model: "deterministic-fixture",
          runtime: "node-test",
          tools: ["filesystem"],
          permissions: "test-only",
          repository_commit: "0123456789abcdef0123456789abcdef01234567",
          time_limit_minutes: 10,
          attempt: 1,
          skill_tree_sha256: hashes[configuration],
          total_tokens: configuration === "with_skill" ? 1200 : 1000,
          duration_ms: durationMs,
          total_duration_seconds: durationMs / 1000,
        };
        fs.writeFileSync(path.join(runRoot, "timing.json"), JSON.stringify(timing));
      }
    }
  }
  const collected = collectWorkspace({ appRoot, exerciseRoot, evals });
  assert.deepEqual(collected.failures, []);
  assert.equal(collected.runs.length, 36);
  const benchmark = buildBenchmark(collected, evals);
  assert.equal(benchmark.gate.passed, true);
  assert.equal(benchmark.run_summary.with_skill.held_out.pass_rate.mean, 1);
  assert.equal(benchmark.run_summary.without_skill.held_out.pass_rate.mean, 0);
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
console.log("benchmark and output-grading framework self-test passed");
