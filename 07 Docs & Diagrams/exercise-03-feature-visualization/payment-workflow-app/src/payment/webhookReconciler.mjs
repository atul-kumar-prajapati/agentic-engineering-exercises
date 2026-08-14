/** Seeded reconciler: it validates signatures but does not enforce idempotency or reference ownership. */
export function reconcileCapturedWebhook(state, event, signature) {
  if (signature !== `sig_${event.gatewayReference}`) throw new Error("Invalid webhook signature"); // VIS: VIS-08
  state.ledgerEntries.push({ eventId: event.id, gatewayReference: event.gatewayReference, type: "capture" }); // VIS: VIS-07
  state.handledEventIds.add(event.id); // VIS: VIS-11
  return "recorded";
}
