const OVERSIZED_CONTEXT_BYTES = 8000;

function assertOrderedEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("events must be an ordered array of raw session events");
  }

  let previousSequence = Number.NEGATIVE_INFINITY;
  for (const event of events) {
    if (event == null || typeof event !== "object") {
      throw new Error("malformed event: each item must be an object with required fields");
    }
    if (typeof event.sequence !== "number" || !Number.isFinite(event.sequence)) {
      throw new Error("malformed event: sequence must be a finite number");
    }
    if (event.sequence <= previousSequence) {
      throw new Error("duplicate or non-increasing sequence numbers are not allowed");
    }
    previousSequence = event.sequence;
    if (typeof event.type !== "string" || event.type.length === 0) {
      throw new Error("malformed event: type is a required field");
    }
    if (event.type === "context" && (typeof event.bytes !== "number" || !Number.isFinite(event.bytes))) {
      throw new Error("malformed context event: bytes is required and must be a finite number");
    }
  }
}

function readIdentity(event) {
  return `${event.target}::${event.contentVersion}`;
}

function commandIdentity(event) {
  return `${event.target}::${event.workspaceRevision}`;
}

export function analyzeSession(events) {
  assertOrderedEvents(events);

  let duplicateReads = 0;
  let unchangedFailureRetries = 0;
  let oversizedContextLoads = 0;
  const seenReads = new Set();
  const failedCommandsSinceReset = new Set();
  let lastWriteSequence = Number.NEGATIVE_INFINITY;

  for (const event of events) {
    if (event.type === "diagnosis") {
      failedCommandsSinceReset.clear();
      continue;
    }

    if (event.type === "read") {
      const identity = readIdentity(event);
      if (seenReads.has(identity)) {
        duplicateReads += 1;
      } else {
        seenReads.add(identity);
      }
      continue;
    }

    if (event.type === "context") {
      if (event.bytes > OVERSIZED_CONTEXT_BYTES) {
        oversizedContextLoads += 1;
      }
      continue;
    }

    if (event.type === "write") {
      lastWriteSequence = event.sequence;
      continue;
    }

    if (event.type === "command" && event.result === "failed") {
      const identity = commandIdentity(event);
      if (failedCommandsSinceReset.has(identity)) {
        unchangedFailureRetries += 1;
      } else {
        failedCommandsSinceReset.add(identity);
      }
    }
  }

  let finalVerificationRuns = 0;
  for (const event of events) {
    if (
      event.type === "command" &&
      event.phase === "final-verification" &&
      event.result === "passed" &&
      event.sequence > lastWriteSequence
    ) {
      finalVerificationRuns += 1;
    }
  }

  return {
    totalEvents: events.length,
    duplicateReads,
    unchangedFailureRetries,
    oversizedContextLoads,
    preventableCalls: duplicateReads + unchangedFailureRetries + oversizedContextLoads,
    finalVerificationRuns,
    correctnessPassed: finalVerificationRuns > 0,
  };
}
