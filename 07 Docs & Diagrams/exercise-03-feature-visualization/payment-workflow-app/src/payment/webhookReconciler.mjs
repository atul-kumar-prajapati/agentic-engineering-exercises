/** Incident-backed reconciler: signature first, then reference ownership, then duplicate-event idempotency. */
export function reconcileCapturedWebhook(state, event, signature) {
  if (signature !== `sig_${event.gatewayReference}`) throw new Error("Invalid webhook signature"); // VIS: VIS-08
  if (!state.knownGatewayReferences.has(event.gatewayReference)) throw new Error(`Unknown gateway reference: ${event.gatewayReference}`); // VIS: VIS-09
  if (state.handledEventIds.has(event.id)) return "already-handled"; // VIS: VIS-10
  state.ledgerEntries.push({ eventId: event.id, gatewayReference: event.gatewayReference, type: "capture" }); // VIS: VIS-07
  state.handledEventIds.add(event.id); // VIS: VIS-11
  return "recorded";
}
