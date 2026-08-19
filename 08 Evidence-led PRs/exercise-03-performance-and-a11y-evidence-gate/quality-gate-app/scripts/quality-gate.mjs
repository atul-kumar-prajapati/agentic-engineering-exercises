/**
 * Pessimistic performance and accessibility release gate.
 *
 * Reads exactly three raw Lighthouse JSON reports and one axe JSON report,
 * binds them to a 40-character source SHA, and writes quality-summary.json
 * before setting process.exitCode. The release decision uses the worst run:
 * minimum performance, minimum accessibility, maximum LCP, and any axe
 * violation. One failing run or one axe finding must fail the gate even when
 * the other artifacts pass. The summary shape is produced by the protected
 * expectedSummary helper so the committed file is digest-bound to the raw
 * reports rather than a hand-written average.
 */
import fs from "node:fs";
import path from "node:path";
import {
  expectedSummary,
  readAxeEvidence,
  readLighthouseReports,
} from "./quality-verification.mjs";

function requiredArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1] || String(process.argv[index + 1]).startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return process.argv[index + 1];
}

const lighthouseDir = path.resolve(requiredArg("--lighthouse-dir"));
const axePath = path.resolve(requiredArg("--axe"));
const contractPath = path.resolve(requiredArg("--contract"));
const sourceSha = requiredArg("--sha");
const outputPath = path.resolve(requiredArg("--output"));

if (!/^[a-f0-9]{40}$/.test(sourceSha)) {
  throw new Error("--sha must be a 40-character lowercase Git SHA");
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const lighthouse = readLighthouseReports(lighthouseDir, contract);
const lighthouseMajor = lighthouse.runs[0]?.environment?.browserMajor ?? null;
const axe = readAxeEvidence(axePath, sourceSha, contract, lighthouseMajor);

let document;
if (lighthouse.runs.length === contract.lighthouseRuns && axe.axe) {
  document = expectedSummary({
    sourceSha,
    contract,
    runs: lighthouse.runs,
    axe: axe.axe,
  });
  const evidenceFailures = [...lighthouse.failures, ...axe.failures];
  if (evidenceFailures.length > 0) {
    document = {
      ...document,
      failures: [...evidenceFailures, ...document.failures],
      releaseDecision: "failed",
    };
  }
} else {
  document = {
    schemaVersion: 1,
    sourceSha,
    route: contract.route,
    aggregation: contract.aggregation,
    thresholds: contract.thresholds,
    lighthouseRuns: lighthouse.runs,
    axe: axe.axe,
    worstCase: {
      performance: null,
      accessibility: null,
      largestContentfulPaintMs: null,
      axeViolations: axe.axe?.violations.length ?? null,
    },
    failures: [...lighthouse.failures, ...axe.failures, "incomplete lighthouse or axe evidence"],
    releaseDecision: "failed",
  };
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
process.exitCode = document.releaseDecision === "passed" ? 0 : 1;
