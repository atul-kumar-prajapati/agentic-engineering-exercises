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
  const context = ["docs/review-brief.md", "fixtures/manifest.json", "pr/review-target.diff"];
  const session = { schemaVersion: 1, sessionId: "fresh-session-01", tool: "review-agent", startedAt: "2026-01-01T10:00:00Z", contextMode: "fresh", providedFiles: context, excludedContext: ["instructor answer key", "earlier reviews", "expected finding IDs", "implementation chat"], promptSha256: "c".repeat(64) };
  const diff = "diff --git a/src/view.ts b/src/view.ts\n+changeLifecycle()\ndiff --git a/src/store.ts b/src/store.ts\n+trustStoredValue()\n+mutateSharedValue()\n+writeDuringRead()\n returnFreshCopy()\n";
  const text = "This concrete scenario explains the user impact and provides independently reproduced code evidence.";
  const document = { schemaVersion: 1, ...manifest, sourceSha: "d".repeat(40), reviewerSessionId: session.sessionId, mergeDecision: "request-changes", findings: [
    { id: "LIFECYCLE-1", classification: "blocker", severity: "high", decision: "fix", confidence: "high", file: "src/view.ts", anchor: "changeLifecycle()", scenario: text, impact: text, evidence: text, fix: "Restore the required lifecycle behavior.", testPath: "tests/cache-regressions.test.ts" },
    { id: "STORE-1", classification: "blocker", severity: "high", decision: "fix", confidence: "high", file: "src/store.ts", anchor: "trustStoredValue()", scenario: text, impact: text, evidence: text, fix: "Validate values at the storage boundary.", testPath: "tests/cache-regressions.test.ts" },
    { id: "STATE-1", classification: "blocker", severity: "medium", decision: "fix", confidence: "medium", file: "src/store.ts", anchor: "mutateSharedValue()", scenario: text, impact: text, evidence: text, fix: "Preserve the shared value during transformation.", testPath: "tests/cache-regressions.test.ts" },
    { id: "READ-1", classification: "blocker", severity: "high", decision: "fix", confidence: "high", file: "src/store.ts", anchor: "writeDuringRead()", scenario: text, impact: text, evidence: text, fix: "Keep the read operation free of writes.", testPath: "tests/cache-regressions.test.ts" },
    { id: "CLAIM-1", classification: "unsupported", severity: "info", decision: "dismiss", confidence: "high", file: "src/store.ts", anchor: "returnFreshCopy()", scenario: text, impact: text, evidence: text, dismissalProof: "A focused reproduction shows a fresh value is returned and the shared input remains unchanged." },
  ] };
  assert.deepEqual(verifyTriageDocument(document, session, manifest, temporary, diff), []);
  const leaked = structuredClone(session);
  leaked.providedFiles.push("instructor-answer-key.md");
  assert.ok(verifyTriageDocument(document, leaked, manifest, temporary, diff).some((failure) => failure.includes("exactly")));
  const noisy = structuredClone(document);
  noisy.findings[4].decision = "fix";
  assert.ok(verifyTriageDocument(noisy, session, manifest, temporary, diff).some((failure) => failure.includes("blocker")));
  console.log("fresh triage verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
