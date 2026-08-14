import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { verifyReviewDocument } from "./review-verification.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "review-verifier-test-"));
try {
  const app = path.join(temporary, "review-gauntlet-app");
  fs.mkdirSync(path.join(app, "tests"), { recursive: true });
  fs.writeFileSync(path.join(app, "tests", "review-regressions.test.ts"), "test");
  const manifest = { baseSha: "a".repeat(40), headSha: "b".repeat(40), comparison: "review-base..review-head" };
  const expectations = { findings: [
    { id: "SEC-001", severity: "critical", source: "semgrep", decision: "fix", file: "src/a.ts", line: 1, testTerms: ["html"] },
    { id: "SCAN-001", severity: "info", source: "semgrep", decision: "dismiss", file: "src/b.ts", line: 2, testTerms: ["static"] },
  ] };
  const text = "This concrete reproduction scenario and impact evidence contains html, static, and source-controlled details.";
  const document = {
    schemaVersion: 1,
    ...manifest,
    sourceSha: "c".repeat(40),
    reviewerSession: "fresh-review-01",
    mergeDecision: "request-changes",
    findings: [
      { ...expectations.findings[0], scenario: text, impact: text, evidence: text, fix: "Render the reviewer note as plain text.", testPath: "tests/review-regressions.test.ts" },
      { ...expectations.findings[1], scenario: text, impact: text, evidence: text },
    ],
  };
  assert.deepEqual(verifyReviewDocument(document, manifest, expectations, temporary), []);
  const tampered = structuredClone(document);
  tampered.findings[0].decision = "dismiss";
  assert.ok(verifyReviewDocument(tampered, manifest, expectations, temporary).some((failure) => failure.includes("decision")));
  console.log("review evidence verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
