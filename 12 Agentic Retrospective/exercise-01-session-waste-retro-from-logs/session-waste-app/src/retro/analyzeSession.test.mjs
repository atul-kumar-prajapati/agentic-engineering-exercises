import assert from "node:assert/strict";
import { analyzeSession } from "./analyzeSession.mjs";
import { evaluateCommandAttempt } from "./preflightPolicy.mjs";

function givenSameTargetAndVersionAlreadyRead_whenSessionIsAnalyzed_thenDuplicateReadsIncrementsOnce() {
  // Arrange
  const events = [
    { sequence: 1, type: "read", target: "policy.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 2, type: "read", target: "policy.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 3, type: "read", target: "policy.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.duplicateReads, 1);
  assert.equal(metrics.preventableCalls, 1);
}

function givenIdenticalFailedCommandsAtSameRevision_whenSessionIsAnalyzed_thenUnchangedFailureRetriesCountLaterAttempts() {
  // Arrange
  const events = [
    { sequence: 1, type: "command", target: "npm test", workspaceRevision: 3, phase: "focused-test", result: "failed" },
    { sequence: 2, type: "command", target: "npm test", workspaceRevision: 3, phase: "focused-test", result: "failed" },
    { sequence: 3, type: "command", target: "npm test", workspaceRevision: 3, phase: "focused-test", result: "failed" },
    { sequence: 4, type: "diagnosis", target: "missing fixture", workspaceRevision: 3, result: "ok" },
    { sequence: 5, type: "command", target: "npm test", workspaceRevision: 3, phase: "focused-test", result: "passed" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.unchangedFailureRetries, 2);
  assert.equal(metrics.duplicateReads, 0);
}

function givenPassedFinalVerificationAfterLastWrite_whenSessionIsAnalyzed_thenFinalVerificationRunsAndCorrectnessPass() {
  // Arrange
  const events = [
    { sequence: 1, type: "write", target: "a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
    { sequence: 2, type: "command", target: "npm test", workspaceRevision: 2, phase: "focused-test", result: "passed" },
    { sequence: 3, type: "command", target: "npm verify", workspaceRevision: 2, phase: "final-verification", result: "passed" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.finalVerificationRuns, 1);
  assert.equal(metrics.correctnessPassed, true);
}

function givenClaimAfterWriteWithoutFinalVerification_whenSessionIsAnalyzed_thenCorrectnessDoesNotPass() {
  // Arrange
  const events = [
    { sequence: 1, type: "write", target: "a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
    { sequence: 2, type: "claim", target: "task complete", workspaceRevision: 2, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.finalVerificationRuns, 0);
  assert.equal(metrics.correctnessPassed, false);
}

function givenFailedCommandAtRevision_whenPreflightEvaluatesSameCommand_thenDiagnosisOrChangeIsRequired() {
  // Arrange
  const events = [
    { sequence: 1, type: "command", target: "npm test", workspaceRevision: 4, phase: "focused-test", result: "failed" },
  ];

  // Act
  const decision = evaluateCommandAttempt({ command: "npm test", workspaceRevision: 4, events });

  // Assert
  assert.deepEqual(decision, { allowed: false, reason: "DIAGNOSIS_OR_CHANGE_REQUIRED" });
}

givenSameTargetAndVersionAlreadyRead_whenSessionIsAnalyzed_thenDuplicateReadsIncrementsOnce();
givenIdenticalFailedCommandsAtSameRevision_whenSessionIsAnalyzed_thenUnchangedFailureRetriesCountLaterAttempts();
givenPassedFinalVerificationAfterLastWrite_whenSessionIsAnalyzed_thenFinalVerificationRunsAndCorrectnessPass();
givenClaimAfterWriteWithoutFinalVerification_whenSessionIsAnalyzed_thenCorrectnessDoesNotPass();
givenFailedCommandAtRevision_whenPreflightEvaluatesSameCommand_thenDiagnosisOrChangeIsRequired();

console.log("PASS participant analyzeSession tests");
