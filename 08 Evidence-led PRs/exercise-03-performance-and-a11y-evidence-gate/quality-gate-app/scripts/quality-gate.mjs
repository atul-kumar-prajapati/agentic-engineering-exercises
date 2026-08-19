import fs from "node:fs";
import path from "node:path";
import {
  expectedSummary,
  readAxeEvidence,
  readLighthouseReports,
} from "./quality-verification.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) {
    throw new Error(`Missing required argument ${name}`);
  }
  return process.argv[index + 1];
}

function writeDecision(outputPath, summary) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
}

const lighthouseDir = path.resolve(argument("--lighthouse-dir"));
const axePath = path.resolve(argument("--axe"));
const contractPath = path.resolve(argument("--contract"));
const sourceSha = argument("--sha");
const outputPath = path.resolve(argument("--output"));

let contract;
try {
  contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
} catch (error) {
  writeDecision(outputPath, {
    schemaVersion: 1,
    sourceSha,
    route: "/",
    aggregation: "pessimistic",
    thresholds: {},
    lighthouseRuns: [],
    axe: null,
    worstCase: {
      performance: 0,
      accessibility: 0,
      largestContentfulPaintMs: Number.POSITIVE_INFINITY,
      axeViolations: Number.POSITIVE_INFINITY,
    },
    failures: [`unable to read --contract: ${error.message}`],
    releaseDecision: "failed",
  });
  process.exitCode = 1;
  process.exit(process.exitCode);
}

const lighthouse = readLighthouseReports(lighthouseDir, contract);
const axe = readAxeEvidence(
  axePath,
  sourceSha,
  contract,
  lighthouse.runs[0]?.environment?.browserMajor,
);

const structuralFailures = [];
if (!/^[a-f0-9]{40}$/.test(sourceSha)) {
  structuralFailures.push("source SHA must be a full 40-character Git SHA");
}
structuralFailures.push(...lighthouse.failures);
structuralFailures.push(...axe.failures);

let summary;
if (
  lighthouse.runs.length === contract.lighthouseRuns &&
  axe.axe &&
  /^[a-f0-9]{40}$/.test(sourceSha)
) {
  summary = expectedSummary({
    sourceSha,
    contract,
    runs: lighthouse.runs,
    axe: axe.axe,
  });
  if (structuralFailures.length) {
    summary = {
      ...summary,
      failures: [...structuralFailures, ...summary.failures],
      releaseDecision: "failed",
    };
  }
} else {
  summary = {
    schemaVersion: 1,
    sourceSha,
    route: contract.route,
    aggregation: contract.aggregation,
    thresholds: contract.thresholds,
    lighthouseRuns: lighthouse.runs,
    axe: axe.axe,
    worstCase: {
      performance: lighthouse.runs.length
        ? Math.min(...lighthouse.runs.map((run) => run.performance))
        : 0,
      accessibility: lighthouse.runs.length
        ? Math.min(...lighthouse.runs.map((run) => run.accessibility))
        : 0,
      largestContentfulPaintMs: lighthouse.runs.length
        ? Math.max(...lighthouse.runs.map((run) => run.largestContentfulPaintMs))
        : Number.POSITIVE_INFINITY,
      axeViolations: Array.isArray(axe.axe?.violations) ? axe.axe.violations.length : Number.POSITIVE_INFINITY,
    },
    failures: [...structuralFailures, "invalid or incomplete evidence"],
    releaseDecision: "failed",
  };
}

writeDecision(outputPath, summary);
process.exitCode = summary.releaseDecision === "passed" ? 0 : 1;
