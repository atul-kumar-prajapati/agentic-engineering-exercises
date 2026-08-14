import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { verifyTriageDocument } from "./triage-verification.mjs";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "triage-verifier-test-"));
try {
  fs.mkdirSync(path.join(temporary, "fresh-review-app", "tests"), { recursive: true });
  fs.writeFileSync(path.join(temporary, "fresh-review-app", "tests", "cache-regressions.test.ts"), "test");
  const manifest = { baseSha: "a".repeat(40), headSha: "b".repeat(40), comparison: "review-base..review-head" };
  const expectations = { findings: [
    { id: "CACHE-001", classification: "blocker", severity: "high", decision: "fix", file: "src/App.tsx", line: 41, testTerms: ["filter"] },
    { id: "CLAIM-001", classification: "unsupported", severity: "info", decision: "dismiss", file: "src/api.ts", line: 22, testTerms: ["new object"] },
  ] };
  const context = ["docs/review-brief.md", "fixtures/manifest.json", "pr/review-target.diff"];
  const session = { schemaVersion: 1, sessionId: "fresh-session-01", tool: "review-agent", startedAt: "2026-01-01T10:00:00Z", contextMode: "fresh", providedFiles: context, excludedContext: ["docs/implementer-notes.md", "earlier reviews", "expected finding IDs", "implementation chat"], promptSha256: "c".repeat(64) };
  const text = "This concrete filter scenario proves impact and evidence because the function returns a new object and does not mutate shared state.";
  const document = { schemaVersion: 1, ...manifest, sourceSha: "d".repeat(40), reviewerSessionId: session.sessionId, mergeDecision: "request-changes", findings: [
    { ...expectations.findings[0], confidence: "high", scenario: text, impact: text, evidence: text, fix: "Remove the destructive filter side effect.", testPath: "tests/cache-regressions.test.ts" },
    { ...expectations.findings[1], confidence: "high", scenario: text, impact: text, evidence: text },
  ] };
  assert.deepEqual(verifyTriageDocument(document, session, manifest, expectations, temporary), []);
  const leaked = structuredClone(session);
  leaked.providedFiles.push("docs/implementer-notes.md");
  assert.ok(verifyTriageDocument(document, leaked, manifest, expectations, temporary).some((failure) => failure.includes("exactly")));
  const noisy = structuredClone(document);
  noisy.findings[1].decision = "fix";
  assert.ok(verifyTriageDocument(noisy, session, manifest, expectations, temporary).some((failure) => failure.includes("decision")));
  console.log("fresh triage verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
