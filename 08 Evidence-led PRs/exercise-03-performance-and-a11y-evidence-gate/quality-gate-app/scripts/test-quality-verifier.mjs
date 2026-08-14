import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  expectedSummary,
  readAxeEvidence,
  readLighthouseReports,
  renderComparison,
  verifyLighthouseConfig,
  verifySummary,
} from "./quality-verification.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "quality-verifier-self-test-"));
try {
  const lighthouseDirectory = path.join(temporary, "lighthouse");
  fs.mkdirSync(lighthouseDirectory);
  const contract = {
    schemaVersion: 1,
    route: "/",
    lighthouseRuns: 3,
    aggregation: "pessimistic",
    thresholds: { minimumPerformance: 0.9, minimumAccessibility: 1, maximumLargestContentfulPaintMs: 2500, maximumAxeViolations: 0 },
  };
  function report(index, performance, lcp) {
    return {
      lighthouseVersion: "12.0.0",
      fetchTime: `2026-08-14T10:30:0${index}.000Z`,
      finalUrl: "http://localhost:4010/",
      categories: { performance: { score: performance }, accessibility: { score: 1 } },
      audits: { "largest-contentful-paint": { numericValue: lcp } },
      environment: { hostUserAgent: "Chrome/140.0", networkUserAgent: "Chrome/140.0" },
      configSettings: { formFactor: "mobile", throttlingMethod: "simulate" },
    };
  }
  [report(1, 0.94, 2100), report(2, 0.92, 2300), report(3, 0.91, 2400)].forEach((document, index) => {
    fs.writeFileSync(path.join(lighthouseDirectory, `run-${index + 1}.json`), `${JSON.stringify(document, null, 2)}\n`);
  });
  const sha = "a".repeat(40);
  const axePath = path.join(temporary, "axe.json");
  fs.writeFileSync(axePath, `${JSON.stringify({ schemaVersion: 1, sourceSha: sha, testedUrl: "http://127.0.0.1:4173/", route: "/", generatedAt: "2026-08-14T10:31:00.000Z", browser: { name: "chrome", version: "140.0.0" }, violations: [] }, null, 2)}\n`);
  const lighthouse = readLighthouseReports(lighthouseDirectory, contract);
  assert.deepEqual(lighthouse.failures, []);
  const axe = readAxeEvidence(axePath, sha, contract, "140");
  assert.deepEqual(axe.failures, []);
  const summary = expectedSummary({ sourceSha: sha, contract, runs: lighthouse.runs, axe: axe.axe });
  assert.equal(summary.releaseDecision, "passed");
  assert.deepEqual(summary.worstCase, { performance: 0.91, accessibility: 1, largestContentfulPaintMs: 2400, axeViolations: 0 });
  assert.deepEqual(verifySummary(structuredClone(summary), summary), []);
  const tampered = structuredClone(summary);
  tampered.worstCase.performance = 0.99;
  assert.ok(verifySummary(tampered, summary).length > 0);
  const config = {
    ci: {
      collect: { staticDistDir: "./dist", url: ["http://localhost/"], numberOfRuns: 3, settings: { onlyCategories: ["performance", "accessibility"] } },
      assert: { assertions: {
        "categories:performance": ["error", { minScore: 0.9, aggregationMethod: "pessimistic" }],
        "categories:accessibility": ["error", { minScore: 1, aggregationMethod: "pessimistic" }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500, aggregationMethod: "pessimistic" }],
      } },
    },
  };
  assert.deepEqual(verifyLighthouseConfig(config, contract), []);
  config.ci.assert.assertions["categories:performance"][1].aggregationMethod = "optimistic";
  assert.ok(verifyLighthouseConfig(config, contract).some((failure) => failure.includes("categories:performance")));
  const comparison = renderComparison(summary, { worstCase: { performance: 0.82, accessibility: 0.91, largestContentfulPaintMs: 3380 } }, { violations: [{}] });
  assert.ok(comparison.includes("Failure-path proof") && comparison.includes(summary.lighthouseRuns[0].sha256));
  console.log("quality evidence verifier self-test passed");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
