import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const CONFIGURATIONS = ["without_skill", "starter_skill", "with_skill"];
export const RUNS_PER_CONFIGURATION = 3;

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function walk(directory, root = directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`skill package must not contain symbolic link ${path.relative(root, absolute)}`);
    if (entry.isDirectory() && !["__pycache__", "node_modules"].includes(entry.name)) results.push(...walk(absolute, root));
    if (entry.isFile() && entry.name !== ".DS_Store" && !entry.name.endsWith(".pyc")) results.push(path.relative(root, absolute).replaceAll(path.sep, "/"));
  }
  return results;
}

export function skillManifest(skillDirectory) {
  if (!fs.existsSync(skillDirectory)) throw new Error(`missing skill directory ${skillDirectory}`);
  const allowedRoots = new Set(["SKILL.md", "references", "scripts", "assets"]);
  const files = walk(skillDirectory).sort();
  const invalid = files.filter((file) => !allowedRoots.has(file.split("/")[0]));
  if (invalid.length) throw new Error(`skill contains non-package files: ${invalid.join(", ")}`);
  if (!files.includes("SKILL.md")) throw new Error("skill package is missing SKILL.md");
  const manifest = files.map((file) => ({ file, sha256: sha256(fs.readFileSync(path.join(skillDirectory, ...file.split("/")))) }));
  const tree = manifest.map((item) => `${item.file}\0${item.sha256}\n`).join("");
  return { files: manifest, tree_sha256: sha256(Buffer.from(tree, "utf8")) };
}

function evaluateCheck(check, output) {
  const normalized = output.toLowerCase();
  if (check.type === "contains_all") {
    const missing = check.values.filter((value) => !normalized.includes(value.toLowerCase()));
    return { passed: !missing.length, evidence: missing.length ? `Missing required values: ${missing.join(", ")}` : `Found required values: ${check.values.join(", ")}` };
  }
  if (check.type === "contains_any") {
    const found = check.values.filter((value) => normalized.includes(value.toLowerCase()));
    return { passed: found.length > 0, evidence: found.length ? `Found boundary language: ${found.join(", ")}` : `Expected one of: ${check.values.join(", ")}` };
  }
  if (check.type === "not_matches") {
    const matched = new RegExp(check.pattern, "is").test(output);
    return { passed: !matched, evidence: matched ? `Output matched forbidden pattern: ${check.pattern}` : `Forbidden pattern was absent: ${check.pattern}` };
  }
  return { passed: false, evidence: `Unknown check type: ${check.type}` };
}

export function gradeOutput(evalDefinition, output) {
  const expectations = evalDefinition.expectations.map((expectation) => {
    const checks = expectation.checks.map((check) => evaluateCheck(check, output));
    return {
      id: expectation.id,
      text: expectation.text,
      critical: expectation.critical,
      passed: checks.every((check) => check.passed),
      evidence: checks.map((check) => check.evidence).join("; "),
    };
  });
  const passed = expectations.filter((item) => item.passed).length;
  return {
    expectations,
    summary: { passed, failed: expectations.length - passed, total: expectations.length, pass_rate: passed / expectations.length },
  };
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${label}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    failures.push(`${label} is invalid JSON`);
    return null;
  }
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function environmentSignature(timing) {
  return JSON.stringify(stable({
    agent: timing.agent,
    model: timing.model,
    runtime: timing.runtime,
    tools: timing.tools,
    permissions: timing.permissions,
    repository_commit: timing.repository_commit,
    time_limit_minutes: timing.time_limit_minutes,
    attempt: timing.attempt,
  }));
}

function validateTiming(timing, expected, skillHash, failures, label) {
  if (!timing || typeof timing !== "object") return;
  if (timing.eval_id !== expected.evalId) failures.push(`${label} eval_id must be ${expected.evalId}`);
  if (timing.configuration !== expected.configuration) failures.push(`${label} configuration must be ${expected.configuration}`);
  if (timing.run_number !== expected.runNumber) failures.push(`${label} run_number must be ${expected.runNumber}`);
  for (const field of ["agent", "model", "runtime", "permissions"]) if (typeof timing[field] !== "string" || timing[field].trim().length < 2) failures.push(`${label} needs ${field}`);
  if (!Array.isArray(timing.tools) || !timing.tools.length || timing.tools.some((item) => typeof item !== "string")) failures.push(`${label} needs the enabled tools list`);
  if (!/^[a-f0-9]{40}$/i.test(timing.repository_commit ?? "")) failures.push(`${label} repository_commit must be a 40-character SHA`);
  if (!Number.isFinite(timing.time_limit_minutes) || timing.time_limit_minutes <= 0) failures.push(`${label} needs a positive time limit`);
  if (timing.attempt !== 1) failures.push(`${label} must record the first attempt`);
  if (timing.skill_tree_sha256 !== skillHash) failures.push(`${label} skill_tree_sha256 does not match the evaluated configuration`);
  if (!Number.isInteger(timing.total_tokens) || timing.total_tokens <= 0) failures.push(`${label} needs a positive integer total_tokens`);
  if (!Number.isInteger(timing.duration_ms) || timing.duration_ms <= 0) failures.push(`${label} needs a positive integer duration_ms`);
  if (!Number.isFinite(timing.total_duration_seconds) || Math.abs(timing.total_duration_seconds - timing.duration_ms / 1000) > 0.01) failures.push(`${label} total_duration_seconds must equal duration_ms / 1000`);
}

export function collectWorkspace({ appRoot, exerciseRoot, evals }) {
  const failures = [];
  const starter = skillManifest(path.join(appRoot, "fixtures", "incident-summary-starter"));
  const candidate = skillManifest(path.join(appRoot, "skills", "incident-summary"));
  const hashes = { without_skill: null, starter_skill: starter.tree_sha256, with_skill: candidate.tree_sha256 };
  const runs = [];
  const signatures = new Map();

  for (const evalDefinition of evals) {
    for (const configuration of CONFIGURATIONS) {
      for (let runNumber = 1; runNumber <= RUNS_PER_CONFIGURATION; runNumber += 1) {
        const relative = path.join("benchmark-workspace", `eval-${evalDefinition.id}`, configuration, `run-${runNumber}`);
        const runRoot = path.join(exerciseRoot, relative);
        const outputPath = path.join(runRoot, "outputs", "incident-summary.md");
        const timingPath = path.join(runRoot, "timing.json");
        const gradingPath = path.join(runRoot, "grading.json");
        if (!fs.existsSync(outputPath)) {
          failures.push(`missing ${path.join(relative, "outputs", "incident-summary.md")}`);
          continue;
        }
        const output = fs.readFileSync(outputPath, "utf8");
        if (output.trim().length < 200) failures.push(`${path.join(relative, "outputs", "incident-summary.md")} is too short to be a complete incident report`);
        const timing = readJson(timingPath, failures, path.join(relative, "timing.json"));
        const grading = readJson(gradingPath, failures, path.join(relative, "grading.json"));
        const expected = { evalId: evalDefinition.id, configuration, runNumber };
        validateTiming(timing, expected, hashes[configuration], failures, path.join(relative, "timing.json"));
        const recomputed = gradeOutput(evalDefinition, output);
        if (grading && JSON.stringify(grading) !== JSON.stringify(recomputed)) failures.push(`${path.join(relative, "grading.json")} does not match output-derived grading`);

        if (timing) {
          const parityKey = `${evalDefinition.id}:${runNumber}`;
          const signature = environmentSignature(timing);
          if (!signatures.has(parityKey)) signatures.set(parityKey, signature);
          else if (signatures.get(parityKey) !== signature) failures.push(`run conditions differ across configurations for eval ${evalDefinition.id}, run ${runNumber}`);
        }
        if (timing && grading) {
          const critical = recomputed.expectations.filter((item) => item.critical);
          runs.push({
            eval_id: evalDefinition.id,
            eval_name: evalDefinition.name,
            split: evalDefinition.split,
            configuration,
            run_number: runNumber,
            result: {
              pass_rate: recomputed.summary.pass_rate,
              critical_pass_rate: critical.filter((item) => item.passed).length / critical.length,
              passed: recomputed.summary.passed,
              failed: recomputed.summary.failed,
              total: recomputed.summary.total,
              time_seconds: timing.total_duration_seconds,
              tokens: timing.total_tokens,
            },
            expectations: recomputed.expectations,
          });
        }
      }
    }
  }
  return { failures, runs, hashes, candidateManifest: candidate, starterManifest: starter };
}

function statistics(values) {
  if (!values.length) return { mean: 0, stddev: 0, min: 0, max: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, stddev: Math.sqrt(variance), min: Math.min(...values), max: Math.max(...values) };
}

function summarize(runs, configuration, split) {
  const selected = runs.filter((run) => run.configuration === configuration && (split === "overall" || run.split === split));
  return {
    runs: selected.length,
    pass_rate: statistics(selected.map((run) => run.result.pass_rate)),
    critical_pass_rate: statistics(selected.map((run) => run.result.critical_pass_rate)),
    tokens: statistics(selected.map((run) => run.result.tokens)),
    time_seconds: statistics(selected.map((run) => run.result.time_seconds)),
  };
}

export function buildBenchmark(collected, evals) {
  const runSummary = {};
  for (const configuration of CONFIGURATIONS) {
    runSummary[configuration] = {
      train: summarize(collected.runs, configuration, "train"),
      held_out: summarize(collected.runs, configuration, "held-out"),
      overall: summarize(collected.runs, configuration, "overall"),
    };
  }
  const candidate = runSummary.with_skill;
  const noSkill = runSummary.without_skill;
  const starter = runSummary.starter_skill;
  const strongestBaseline = [
    { id: "without_skill", summary: noSkill },
    { id: "starter_skill", summary: starter },
  ].sort((left, right) => right.summary.held_out.pass_rate.mean - left.summary.held_out.pass_rate.mean || right.summary.held_out.critical_pass_rate.mean - left.summary.held_out.critical_pass_rate.mean)[0];
  const ceilingMode = strongestBaseline.summary.held_out.pass_rate.mean >= 0.95;
  const tokenRatio = candidate.overall.tokens.mean / strongestBaseline.summary.overall.tokens.mean;
  const elapsedRatio = candidate.overall.time_seconds.mean / strongestBaseline.summary.overall.time_seconds.mean;
  const varianceImprovement = strongestBaseline.summary.held_out.pass_rate.stddev - candidate.held_out.pass_rate.stddev;
  const comparisonChecks = ceilingMode
    ? [
        { id: "ceiling-quality-no-regression", passed: candidate.held_out.pass_rate.mean >= strongestBaseline.summary.held_out.pass_rate.mean, actual: candidate.held_out.pass_rate.mean - strongestBaseline.summary.held_out.pass_rate.mean, required: ">= 0.00 vs strongest baseline" },
        { id: "ceiling-critical-no-regression", passed: candidate.held_out.critical_pass_rate.mean >= strongestBaseline.summary.held_out.critical_pass_rate.mean, actual: candidate.held_out.critical_pass_rate.mean - strongestBaseline.summary.held_out.critical_pass_rate.mean, required: ">= 0.00 vs strongest baseline" },
        { id: "ceiling-measurable-value", passed: tokenRatio <= 0.85 || elapsedRatio <= 0.85 || varianceImprovement >= 0.02, actual: `tokens ${tokenRatio.toFixed(3)}x, elapsed ${elapsedRatio.toFixed(3)}x, variance improvement ${varianceImprovement.toFixed(3)}`, required: "tokens <= 0.85x OR elapsed <= 0.85x OR variance improvement >= 0.02" },
      ]
    : [
        { id: "improve-over-no-skill", passed: candidate.held_out.pass_rate.mean - noSkill.held_out.pass_rate.mean >= 0.1, actual: candidate.held_out.pass_rate.mean - noSkill.held_out.pass_rate.mean, required: ">= 0.10" },
        { id: "improve-over-starter", passed: candidate.held_out.pass_rate.mean - starter.held_out.pass_rate.mean >= 0.1, actual: candidate.held_out.pass_rate.mean - starter.held_out.pass_rate.mean, required: ">= 0.10" },
      ];
  const checks = [
    { id: "train-quality", passed: candidate.train.pass_rate.mean >= 0.875, actual: candidate.train.pass_rate.mean, required: ">= 0.875" },
    { id: "held-out-quality", passed: candidate.held_out.pass_rate.mean >= 0.875, actual: candidate.held_out.pass_rate.mean, required: ">= 0.875" },
    { id: "held-out-critical", passed: candidate.held_out.critical_pass_rate.mean === 1, actual: candidate.held_out.critical_pass_rate.mean, required: "= 1.0" },
    ...comparisonChecks,
    { id: "held-out-variance", passed: candidate.held_out.pass_rate.stddev <= 0.16, actual: candidate.held_out.pass_rate.stddev, required: "<= 0.16" },
    { id: "token-cost", passed: candidate.overall.tokens.mean <= noSkill.overall.tokens.mean * 1.5, actual: candidate.overall.tokens.mean / noSkill.overall.tokens.mean, required: "<= 1.50x no-skill" },
    { id: "elapsed-cost", passed: candidate.overall.time_seconds.mean <= noSkill.overall.time_seconds.mean * 2, actual: candidate.overall.time_seconds.mean / noSkill.overall.time_seconds.mean, required: "<= 2.00x no-skill" },
  ];
  const commonChecks = checks.filter((check) => !comparisonChecks.some((comparison) => comparison.id === check.id));
  return {
    schema_version: 2,
    metadata: {
      skill_name: "incident-summary",
      candidate_skill_sha256: collected.hashes.with_skill,
      starter_skill_sha256: collected.hashes.starter_skill,
      evals_run: evals.map((item) => item.id),
      configurations: CONFIGURATIONS,
      runs_per_configuration: RUNS_PER_CONFIGURATION,
    },
    runs: collected.runs,
    run_summary: runSummary,
    gate: {
      passed: checks.every((check) => check.passed),
      mode: ceilingMode ? "ceiling-aware" : "quality-improvement",
      comparison_baseline: strongestBaseline.id,
      common_passed: commonChecks.every((check) => check.passed),
      comparison_passed: comparisonChecks.every((check) => check.passed),
      checks,
    },
  };
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function benchmarkMarkdown(benchmark) {
  const rows = CONFIGURATIONS.map((configuration) => {
    const summary = benchmark.run_summary[configuration];
    return `| ${configuration} | ${percent(summary.train.pass_rate.mean)} | ${percent(summary.held_out.pass_rate.mean)} | ${percent(summary.held_out.critical_pass_rate.mean)} | ${percent(summary.held_out.pass_rate.stddev)} | ${summary.overall.tokens.mean.toFixed(0)} | ${summary.overall.time_seconds.mean.toFixed(1)}s |`;
  });
  const gates = benchmark.gate.checks.map((check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.id}: ${typeof check.actual === "number" ? check.actual.toFixed(3) : check.actual} (${check.required})`);
  return [
    "# Incident Summary Skill Benchmark",
    "",
    `Candidate skill SHA-256: \`${benchmark.metadata.candidate_skill_sha256}\``,
    "",
    "| Configuration | Train quality | Held-out quality | Held-out critical | Held-out variance | Mean tokens | Mean elapsed |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...rows,
    "",
    `## Package gate: ${benchmark.gate.passed ? "PASS" : "FAIL"}`,
    "",
    `Mode: ${benchmark.gate.mode}; comparison baseline: ${benchmark.gate.comparison_baseline}`,
    "",
    ...gates,
    "",
  ].join("\n");
}
