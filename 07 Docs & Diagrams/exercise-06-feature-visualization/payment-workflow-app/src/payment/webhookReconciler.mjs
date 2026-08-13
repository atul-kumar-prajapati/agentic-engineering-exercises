/** Seeded reconciler: it validates signatures but does not enforce idempotency or reference ownership. */
export function reconcileCapturedWebhook(state, event, signature) {
  if (signature !== `sig_${event.gatewayReference}`) throw new Error("Invalid webhook signature");
  state.ledgerEntries.push({ eventId: event.id, gatewayReference: event.gatewayReference, type: "capture" });
  state.handledEventIds.add(event.id);
  return "recorded";
}
