import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  expectedSummary,
  readAxeEvidence,
  readLighthouseReports,
  renderComparison,
  verifyGateControls,
  verifyGitBinding,
  verifyLighthouseConfig,
  verifySummary,
} from "./quality-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const lighthouseDir = path.join(evidenceRoot, "raw", "lighthouse");
const axePath = path.join(evidenceRoot, "raw", "axe.json");
const summaryPath = path.join(evidenceRoot, "quality-summary.json");
const comparisonPath = path.join(evidenceRoot, "comparison.md");
const contractPath = path.join(exerciseRoot, "fixtures", "quality-thresholds.json");
const baselineLighthouse = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "fixtures", "lighthouse-before.json"), "utf8"));
const baselineAxe = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "fixtures", "a11y-before.json"), "utf8"));
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const failures = [];

let config;
try { config = JSON.parse(fs.readFileSync(path.join(appRoot, "lighthouserc.json"), "utf8")); }
catch { failures.push("missing or invalid lighthouserc.json"); }
if (config) failures.push(...verifyLighthouseConfig(config, contract));

let summary;
try { summary = JSON.parse(fs.readFileSync(summaryPath, "utf8")); }
catch { failures.push("missing or invalid evidence/quality-summary.json"); }
const sourceSha = summary?.sourceSha ?? "";
if (!/^[a-f0-9]{40}$/.test(sourceSha)) failures.push("quality evidence must use one full source SHA");
const lighthouse = readLighthouseReports(lighthouseDir, contract);
failures.push(...lighthouse.failures);
const lighthouseMajor = lighthouse.runs[0]?.environment?.browserMajor;
const axe = readAxeEvidence(axePath, sourceSha, contract, lighthouseMajor);
failures.push(...axe.failures);
let expected;
if (lighthouse.runs.length === contract.lighthouseRuns && axe.axe && /^[a-f0-9]{40}$/.test(sourceSha)) {
  expected = expectedSummary({ sourceSha, contract, runs: lighthouse.runs, axe: axe.axe });
  failures.push(...verifySummary(summary, expected));
  if (expected.releaseDecision !== "passed") failures.push("submitted browser evidence does not meet the release thresholds");
}

if (expected) {
  const expectedComparison = renderComparison(expected, baselineLighthouse, baselineAxe);
  const comparison = fs.existsSync(comparisonPath) ? fs.readFileSync(comparisonPath, "utf8").replaceAll("\r\n", "\n") : "";
  if (comparison !== expectedComparison) failures.push("comparison.md was not generated from the submitted raw evidence");
  failures.push(...verifyGateControls({ appRoot, lighthouseDir, axePath, contractPath, sourceSha, expected }));
}

if (/^[a-f0-9]{40}$/.test(sourceSha)) {
  failures.push(...verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }));
  try {
    const committedAt = Date.parse(execFileSync("git", ["show", "-s", "--format=%cI", sourceSha], { cwd: repositoryRoot, encoding: "utf8" }).trim());
    for (const run of lighthouse.runs) if (Date.parse(run.fetchTime) < committedAt) failures.push(`${run.file} predates the source commit`);
    if (axe.axe && Date.parse(axe.axe.generatedAt) < committedAt) failures.push("axe evidence predates the source commit");
  } catch { failures.push("could not verify browser evidence capture times against the source commit"); }
}

if (failures.length) {
  console.error(`Quality evidence verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${sourceSha}`);
console.log("PASS three raw Lighthouse reports use one route and Chrome environment");
console.log("PASS pessimistic performance, accessibility, LCP, and axe thresholds met");
console.log("PASS raw artifact SHA-256 digests and generated comparison verified");
console.log("PASS performance and axe negative controls return non-zero with failed decisions");
console.log("PASS Git source binding and evidence-only follow-up history verified");
