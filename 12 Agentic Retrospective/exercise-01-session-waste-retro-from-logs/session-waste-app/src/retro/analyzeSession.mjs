const REQUIRED_FIELDS = ["sequence", "type", "target", "workspaceRevision", "result"];
const OVERSIZED_CONTEXT_BYTES = 8000;

function requireFiniteSequence(event) {
  if (typeof event?.sequence !== "number" || !Number.isFinite(event.sequence)) {
    throw new Error("sequence is required and must be a number");
  }
}

function assertStrictlyIncreasingSequences(events) {
  let previous = Number.NEGATIVE_INFINITY;
  const seen = new Set();
  for (const event of events) {
    requireFiniteSequence(event);
    if (seen.has(event.sequence) || event.sequence <= previous) {
      throw new Error("sequence numbers must be unique and strictly increasing");
    }
    seen.add(event.sequence);
    previous = event.sequence;
  }
}

function assertRequiredFields(event) {
  for (const field of REQUIRED_FIELDS) {
    if (event[field] == null || event[field] === "") {
      throw new Error(`malformed required field: ${field}`);
    }
  }
  if (event.type === "context" && (typeof event.bytes !== "number" || !Number.isFinite(event.bytes))) {
    throw new Error("bytes is required for context events");
  }
  if (event.type === "read" && (event.contentVersion == null || event.contentVersion === "")) {
    throw new Error("malformed required field: contentVersion");
  }
}

function countDuplicateReads(events) {
  const seenVersions = new Set();
  let duplicates = 0;
  for (const event of events) {
    if (event.type !== "read") {
      continue;
    }
    const key = `${event.target}\0${event.contentVersion}`;
    if (seenVersions.has(key)) {
      duplicates += 1;
    } else {
      seenVersions.add(key);
    }
  }
  return duplicates;
}

function countUnchangedFailureRetries(events) {
  const failedWithoutDiagnosis = new Map();
  let retries = 0;
  for (const event of events) {
    const revisionPrefix = `${event.workspaceRevision}\0`;
    if (event.type === "diagnosis") {
      for (const key of [...failedWithoutDiagnosis.keys()]) {
        if (key.startsWith(revisionPrefix)) {
          failedWithoutDiagnosis.delete(key);
        }
      }
      continue;
    }
    if (event.type !== "command") {
      continue;
    }
    const key = `${event.workspaceRevision}\0${event.target}`;
    if (event.result === "failed") {
      if (failedWithoutDiagnosis.get(key)) {
        retries += 1;
      }
      failedWithoutDiagnosis.set(key, true);
    } else {
      failedWithoutDiagnosis.delete(key);
    }
  }
  return retries;
}

function measureFinalVerification(events) {
  let lastWriteIndex = -1;
  for (let index = 0; index < events.length; index += 1) {
    if (events[index].type === "write") {
      lastWriteIndex = index;
    }
  }
  let finalVerificationRuns = 0;
  for (let index = lastWriteIndex + 1; index < events.length; index += 1) {
    const event = events[index];
    if (event.type === "command" && event.phase === "final-verification" && event.result === "passed") {
      finalVerificationRuns += 1;
    }
  }
  if (lastWriteIndex < 0) {
    return { finalVerificationRuns: 0, correctnessPassed: false };
  }
  return {
    finalVerificationRuns,
    correctnessPassed: finalVerificationRuns > 0,
  };
}

export function analyzeSession(events) {
  if (!Array.isArray(events)) {
    throw new Error("events must be an ordered array");
  }
  assertStrictlyIncreasingSequences(events);
  for (const event of events) {
    if (event == null || typeof event !== "object") {
      throw new Error("malformed event");
    }
    assertRequiredFields(event);
  }

  const duplicateReads = countDuplicateReads(events);
  const unchangedFailureRetries = countUnchangedFailureRetries(events);
  const oversizedContextLoads = events.filter(
    (event) => event.type === "context" && event.bytes > OVERSIZED_CONTEXT_BYTES,
  ).length;
  const { finalVerificationRuns, correctnessPassed } = measureFinalVerification(events);

  return {
    totalEvents: events.length,
    duplicateReads,
    unchangedFailureRetries,
    oversizedContextLoads,
    preventableCalls: duplicateReads + unchangedFailureRetries + oversizedContextLoads,
    finalVerificationRuns,
    correctnessPassed,
  };
}
