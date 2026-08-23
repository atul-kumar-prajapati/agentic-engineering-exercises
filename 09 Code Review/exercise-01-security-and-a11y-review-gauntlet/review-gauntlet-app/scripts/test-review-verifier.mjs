import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { verifyReviewDocument } from "./review-verification.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "review-verifier-test-"));
try {
  const app = path.join(temporary, "review-gauntlet-app");
  fs.mkdirSync(path.join(app, "tests"), { recursive: true });
  fs.mkdirSync(path.join(app, "src"), { recursive: true });
  fs.writeFileSync(path.join(app, "tests", "review-regressions.test.ts"), "test");
  fs.writeFileSync(path.join(app, "src", "safe.ts"), "export const safeFixture = 'static';\n");
  const manifest = { baseSha: "a".repeat(40), headSha: "b".repeat(40), comparison: "review-base..review-head" };
  const diff = "diff --git a/src/view.ts b/src/view.ts\n+renderPreview(value)\n+disableValidation()\ndiff --git a/src/queue.ts b/src/queue.ts\n+replaceControl()\ndiff --git a/src/policy.ts b/src/policy.ts\n+relaxBoundary()\n";
  const semgrep = { results: [{ path: "src/view.ts" }, { path: "src/safe.ts" }] };
  const text = "This concrete reproduction scenario explains the user impact and provides independently checked code evidence.";
  const document = {
    schemaVersion: 1, ...manifest, sourceSha: "c".repeat(40), reviewerSession: "fresh-review-01", mergeDecision: "request-changes",
    findings: [
      { id: "VIEW-1", severity: "critical", confidence: "high", source: "semgrep", decision: "fix", file: "src/view.ts", anchor: "renderPreview(value)", scenario: text, impact: text, evidence: text, fix: "Restore the required rendering boundary behavior.", testPath: "tests/review-regressions.test.ts" },
      { id: "VALIDATION-1", severity: "high", confidence: "high", source: "manual", decision: "fix", file: "src/view.ts", anchor: "disableValidation()", scenario: text, impact: text, evidence: text, fix: "Restore the required validation behavior.", testPath: "tests/review-regressions.test.ts" },
      { id: "QUEUE-1", severity: "high", confidence: "high", source: "manual", decision: "fix", file: "src/queue.ts", anchor: "replaceControl()", scenario: text, impact: text, evidence: text, fix: "Restore the required interaction behavior.", testPath: "tests/review-regressions.test.ts" },
      { id: "POLICY-1", severity: "high", confidence: "high", source: "manual", decision: "fix", file: "src/policy.ts", anchor: "relaxBoundary()", scenario: text, impact: text, evidence: text, fix: "Restore the trusted boundary invariant.", testPath: "tests/review-regressions.test.ts" },
      { id: "SCAN-1", severity: "info", confidence: "high", source: "semgrep", decision: "dismiss", file: "src/safe.ts", anchor: "safeFixture", scenario: text, impact: text, evidence: text, dismissalProof: "The value is a source-controlled static constant with no untrusted input path." },
    ],
  };
  assert.deepEqual(verifyReviewDocument(document, manifest, temporary, diff, semgrep), []);
  const tampered = structuredClone(document);
  tampered.findings[0].anchor = "not in diff";
  assert.ok(verifyReviewDocument(tampered, manifest, temporary, diff, semgrep).some((failure) => failure.includes("code anchor")));
  console.log("review evidence verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
