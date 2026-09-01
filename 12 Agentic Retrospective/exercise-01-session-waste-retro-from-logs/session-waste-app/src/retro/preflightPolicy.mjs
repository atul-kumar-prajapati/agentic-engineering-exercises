const DIAGNOSIS_OR_CHANGE_REQUIRED = "DIAGNOSIS_OR_CHANGE_REQUIRED";
const FIRST_OR_INFORMED_ATTEMPT = "FIRST_OR_INFORMED_ATTEMPT";

function denyUninformedRetry() {
  return { allowed: false, reason: DIAGNOSIS_OR_CHANGE_REQUIRED };
}

function allowFirstOrInformedAttempt() {
  return { allowed: true, reason: FIRST_OR_INFORMED_ATTEMPT };
}

function isMatchingCommand(event, command, workspaceRevision) {
  return event?.type === "command"
    && event.target === command
    && event.workspaceRevision === workspaceRevision;
}

function latestMatchingCommand(events, command, workspaceRevision) {
  let latest = null;
  for (const event of events) {
    if (!isMatchingCommand(event, command, workspaceRevision)) {
      continue;
    }
    if (latest == null || event.sequence > latest.sequence) {
      latest = event;
    }
  }
  return latest;
}

function hasLaterDiagnosis(events, afterSequence) {
  return events.some((event) => event?.type === "diagnosis" && event.sequence > afterSequence);
}

/**
 * Decide whether a command may run before it executes.
 * Command identity is event.target; revision is event.workspaceRevision.
 * Inspect the latest matching command at that revision and deny only when
 * it failed and no later diagnosis event exists. Does not rewrite traces.
 */
export function evaluateCommandAttempt({ command, workspaceRevision, events }) {
  const history = Array.isArray(events) ? events : [];
  const latest = latestMatchingCommand(history, command, workspaceRevision);

  if (latest == null) {
    return allowFirstOrInformedAttempt();
  }
  if (latest.result !== "failed") {
    return allowFirstOrInformedAttempt();
  }
  if (hasLaterDiagnosis(history, latest.sequence)) {
    return allowFirstOrInformedAttempt();
  }
  return denyUninformedRetry();
}
