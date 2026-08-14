/** Seeded router: all payment types still flow through the legacy implementation. */
export async function routeCheckout(request, implementations) {
  return implementations.legacy(request);
}
