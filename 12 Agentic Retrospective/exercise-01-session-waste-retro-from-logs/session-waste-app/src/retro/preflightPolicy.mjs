const ALLOWED = "FIRST_OR_INFORMED_ATTEMPT";
const BLOCKED = "DIAGNOSIS_OR_CHANGE_REQUIRED";

function eventsAtRevision(events, workspaceRevision) {
  if (!Array.isArray(events)) {
    return [];
  }
  return events.filter((event) => event && event.workspaceRevision === workspaceRevision);
}

function latestIdenticalCommand(events, command) {
  let latest = null;
  for (const event of events) {
    if (event.type === "command" && event.target === command) {
      latest = event;
    }
  }
  return latest;
}

function diagnosisFollows(events, afterSequence) {
  return events.some(
    (event) => event.type === "diagnosis" && Number(event.sequence) > Number(afterSequence),
  );
}

/**
 * Evaluated before a command runs. Does not rewrite trace events.
 * Blocks an identical failed command at the same workspace revision until a
 * diagnosis event is recorded or the caller presents a new revision.
 */
export function evaluateCommandAttempt({ command, workspaceRevision, events }) {
  if (command == null || command === "" || workspaceRevision == null) {
    return { allowed: true, reason: ALLOWED };
  }

  const scoped = eventsAtRevision(events, workspaceRevision);
  const latest = latestIdenticalCommand(scoped, command);

  if (!latest) {
    return { allowed: true, reason: ALLOWED };
  }

  if (latest.result !== "failed") {
    return { allowed: true, reason: ALLOWED };
  }

  if (diagnosisFollows(scoped, latest.sequence)) {
    return { allowed: true, reason: ALLOWED };
  }

  return { allowed: false, reason: BLOCKED };
}
