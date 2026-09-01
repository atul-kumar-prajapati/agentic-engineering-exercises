import assert from "node:assert/strict";
import { analyzeSession } from "./analyzeSession.mjs";
import { evaluateCommandAttempt } from "./preflightPolicy.mjs";

function givenFirstReadOfAVersion_whenSameTargetAndVersionAreReadAgain_thenCountsDuplicateReads() {
  // Arrange
  const events = [
    { sequence: 1, type: "read", target: "src/a.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 2, type: "read", target: "src/a.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 3, type: "read", target: "src/b.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.duplicateReads, 1);
  assert.equal(metrics.totalEvents, 3);
}

function givenFileChangedToNewVersion_whenFileIsReread_thenDoesNotCountDuplicateReads() {
  // Arrange
  const events = [
    { sequence: 1, type: "read", target: "src/a.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 2, type: "write", target: "src/a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
    { sequence: 3, type: "read", target: "src/a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.duplicateReads, 0);
}

function givenFirstFailedCommand_whenIdenticalCommandFailsAgainBeforeDiagnosis_thenCountsUnchangedFailureRetries() {
  // Arrange
  const events = [
    { sequence: 1, type: "command", target: "npm test", workspaceRevision: 1, phase: "focused-test", result: "failed" },
    { sequence: 2, type: "command", target: "npm test", workspaceRevision: 1, phase: "focused-test", result: "failed" },
    { sequence: 3, type: "command", target: "npm test", workspaceRevision: 1, phase: "focused-test", result: "failed" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.unchangedFailureRetries, 2);
}

function givenFailedCommandThenDiagnosis_whenCommandIsRetried_thenDoesNotCountUnchangedFailureRetries() {
  // Arrange
  const events = [
    { sequence: 1, type: "command", target: "npm test", workspaceRevision: 1, phase: "focused-test", result: "failed" },
    { sequence: 2, type: "diagnosis", target: "missing fixture", workspaceRevision: 1, result: "ok" },
    { sequence: 3, type: "command", target: "npm test", workspaceRevision: 1, phase: "focused-test", result: "passed" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.unchangedFailureRetries, 0);
}

function givenContextLoadAboveEightThousandBytes_whenAnalyzed_thenCountsOversizedContextLoads() {
  // Arrange
  const events = [
    { sequence: 1, type: "context", target: "docs/big.md", bytes: 8001, workspaceRevision: 1, result: "ok" },
    { sequence: 2, type: "context", target: "docs/ok.md", bytes: 8000, workspaceRevision: 1, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.oversizedContextLoads, 1);
  assert.equal(metrics.preventableCalls, 1);
}

function givenPassedFinalVerificationAfterLastWrite_whenAnalyzed_thenCountsFinalVerificationRunsAndPassesCorrectness() {
  // Arrange
  const events = [
    { sequence: 1, type: "write", target: "src/a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
    { sequence: 2, type: "command", target: "npm verify", workspaceRevision: 2, phase: "final-verification", result: "passed" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.finalVerificationRuns, 1);
  assert.equal(metrics.correctnessPassed, true);
}

function givenFinalVerificationThenLaterWrite_whenAnalyzed_thenCorrectnessDoesNotPass() {
  // Arrange
  const events = [
    { sequence: 1, type: "command", target: "npm verify", workspaceRevision: 1, phase: "final-verification", result: "passed" },
    { sequence: 2, type: "write", target: "src/a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
  ];

  // Act
  const metrics = analyzeSession(events);

  // Assert
  assert.equal(metrics.finalVerificationRuns, 0);
  assert.equal(metrics.correctnessPassed, false);
}

function givenDuplicateSequenceNumbers_whenAnalyzed_thenThrowsSequenceError() {
  // Arrange
  const events = [
    { sequence: 1, type: "read", target: "a.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
    { sequence: 1, type: "read", target: "b.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
  ];

  // Act / Assert
  assert.throws(() => analyzeSession(events), /sequence/i);
}

function givenContextEventWithoutBytes_whenAnalyzed_thenThrowsBytesError() {
  // Arrange
  const events = [{ sequence: 1, type: "context", target: "x", workspaceRevision: 1, result: "ok" }];

  // Act / Assert
  assert.throws(() => analyzeSession(events), /bytes/i);
}

function givenFailedCommandAtRevision_whenSameCommandIsAttemptedAgain_thenPreflightBlocksUntilDiagnosis() {
  // Arrange
  const failed = [
    { sequence: 1, type: "command", target: "npm test", workspaceRevision: 3, phase: "focused-test", result: "failed" },
  ];

  // Act
  const blocked = evaluateCommandAttempt({ command: "npm test", workspaceRevision: 3, events: failed });
  const afterDiagnosis = evaluateCommandAttempt({
    command: "npm test",
    workspaceRevision: 3,
    events: [...failed, { sequence: 2, type: "diagnosis", target: "env", workspaceRevision: 3, result: "ok" }],
  });

  // Assert
  assert.deepEqual(blocked, { allowed: false, reason: "DIAGNOSIS_OR_CHANGE_REQUIRED" });
  assert.deepEqual(afterDiagnosis, { allowed: true, reason: "FIRST_OR_INFORMED_ATTEMPT" });
}

givenFirstReadOfAVersion_whenSameTargetAndVersionAreReadAgain_thenCountsDuplicateReads();
givenFileChangedToNewVersion_whenFileIsReread_thenDoesNotCountDuplicateReads();
givenFirstFailedCommand_whenIdenticalCommandFailsAgainBeforeDiagnosis_thenCountsUnchangedFailureRetries();
givenFailedCommandThenDiagnosis_whenCommandIsRetried_thenDoesNotCountUnchangedFailureRetries();
givenContextLoadAboveEightThousandBytes_whenAnalyzed_thenCountsOversizedContextLoads();
givenPassedFinalVerificationAfterLastWrite_whenAnalyzed_thenCountsFinalVerificationRunsAndPassesCorrectness();
givenFinalVerificationThenLaterWrite_whenAnalyzed_thenCorrectnessDoesNotPass();
givenDuplicateSequenceNumbers_whenAnalyzed_thenThrowsSequenceError();
givenContextEventWithoutBytes_whenAnalyzed_thenThrowsBytesError();
givenFailedCommandAtRevision_whenSameCommandIsAttemptedAgain_thenPreflightBlocksUntilDiagnosis();

console.log("PASS participant analyzer and retry preflight tests");
