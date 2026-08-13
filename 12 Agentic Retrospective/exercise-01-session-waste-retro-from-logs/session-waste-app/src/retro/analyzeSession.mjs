/** Seeded analyzer: it counts every read and failed command as waste. */
export function analyzeSession(events) {
  const duplicateReads = events.filter((event) => event.type === "read").length;
  const failedRetries = events.filter((event) => event.type === "command" && event.result === "failed").length;
  return { totalCalls: events.length, duplicateReads, failedRetries, finalVerificationRuns: 0, preventableCalls: duplicateReads + failedRetries };
}
