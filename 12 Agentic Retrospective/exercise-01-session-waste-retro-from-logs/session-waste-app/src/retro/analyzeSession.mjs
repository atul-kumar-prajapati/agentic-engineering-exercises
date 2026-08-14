/** Seeded analyzer: it counts every read and failed command as waste. */
export function analyzeSession(events) {
  const duplicateReads = events.filter((event) => event.type === "read").length;
  const unchangedFailureRetries = events.filter((event) => event.type === "command" && event.result === "failed").length;
  return {
    totalEvents: events.length,
    duplicateReads,
    unchangedFailureRetries,
    oversizedContextLoads: 0,
    preventableCalls: duplicateReads + unchangedFailureRetries,
    finalVerificationRuns: 0,
    correctnessPassed: false,
  };
}
