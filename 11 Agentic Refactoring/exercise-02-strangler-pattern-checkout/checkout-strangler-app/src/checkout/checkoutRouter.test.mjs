import assert from "node:assert/strict";
import { createCardCheckout } from "./cardCheckout.mjs";
import { routeCheckout } from "./checkoutRouter.mjs";

const cardRequest = {
  orderId: "ord-route",
  paymentType: "card",
  subtotalCents: 1001,
  taxRateBps: 825,
  paymentToken: "tok",
};

function trackingImplementations({
  cardSliceEnabled = true,
  card = async (request) => ({
    orderId: request.orderId,
    status: "paid",
    totalCents: 1084,
    errorCode: null,
  }),
} = {}) {
  const calls = { legacy: [], card: [] };
  return {
    calls,
    implementations: {
      legacy: async (request) => {
        calls.legacy.push(request.paymentType);
        return { orderId: request.orderId, status: "paid", totalCents: 1084, errorCode: null };
      },
      card: async (request) => {
        calls.card.push(request.paymentType);
        return card(request);
      },
      cardSliceEnabled,
    },
  };
}

async function givenEnabledCard_whenRouted_thenUsesNewSliceWithZeroLegacyCalls() {
  // Arrange
  const authorizeCalls = [];
  const card = createCardCheckout({
    authorize: async (payload) => {
      authorizeCalls.push(payload);
      return { approved: true };
    },
  });
  const { calls, implementations } = trackingImplementations({
    cardSliceEnabled: true,
    card,
  });

  // Act
  const result = await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(result, { orderId: "ord-route", status: "paid", totalCents: 1084, errorCode: null });
  assert.deepEqual(calls, { legacy: [], card: ["card"] });
  assert.equal(authorizeCalls.length, 1);
}

async function givenGiftCard_whenRouted_thenStaysOnLegacy() {
  // Arrange
  const { calls, implementations } = trackingImplementations({ cardSliceEnabled: true });

  // Act
  await routeCheckout({ ...cardRequest, paymentType: "gift-card" }, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: ["gift-card"], card: [] });
}

async function givenInvoice_whenRouted_thenStaysOnLegacy() {
  // Arrange
  const { calls, implementations } = trackingImplementations({ cardSliceEnabled: true });

  // Act
  await routeCheckout({ ...cardRequest, paymentType: "invoice" }, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: ["invoice"], card: [] });
}

async function givenUnknownPaymentType_whenRouted_thenStaysOnLegacy() {
  // Arrange
  const { calls, implementations } = trackingImplementations({ cardSliceEnabled: true });

  // Act
  await routeCheckout({ ...cardRequest, paymentType: "crypto" }, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: ["crypto"], card: [] });
}

async function givenCardSliceDisabled_whenCardRouted_thenUsesLegacyOnly() {
  // Arrange
  const { calls, implementations } = trackingImplementations({ cardSliceEnabled: false });

  // Act
  await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: ["card"], card: [] });
}

async function givenPreAuthorizationFailure_whenCardThrows_thenFallsBackToLegacyOnce() {
  // Arrange
  const { calls, implementations } = trackingImplementations({
    card: async () => {
      throw { authorizationCreated: false };
    },
  });

  // Act
  await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: ["card"], card: ["card"] });
}

async function givenAuthorizationCreatedTrue_whenCardThrows_thenNeverCallsLegacy() {
  // Arrange
  const publicResult = { orderId: "ord-route", status: "failed", totalCents: 1084, errorCode: "PAYMENT_STATE_UNKNOWN" };
  const { calls, implementations } = trackingImplementations({
    card: async () => {
      throw { authorizationCreated: true, result: publicResult };
    },
  });

  // Act
  const result = await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: [], card: ["card"] });
  assert.deepEqual(result, publicResult);
}

async function givenMissingAuthorizationCreated_whenCardThrows_thenNeverCallsLegacy() {
  // Arrange
  const publicResult = { orderId: "ord-route", status: "failed", totalCents: 1084, errorCode: "PAYMENT_STATE_UNKNOWN" };
  const { calls, implementations } = trackingImplementations({
    card: async () => {
      throw { result: publicResult };
    },
  });

  // Act
  const result = await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: [], card: ["card"] });
  assert.deepEqual(result, publicResult);
}

async function givenAmbiguousError_whenCardThrows_thenNeverCallsLegacy() {
  // Arrange
  const { calls, implementations } = trackingImplementations({
    card: async () => {
      throw new Error("gateway outcome unknown");
    },
  });

  // Act
  const result = await routeCheckout(cardRequest, implementations);

  // Assert
  assert.deepEqual(calls, { legacy: [], card: ["card"] });
  assert.deepEqual(result, {
    orderId: "ord-route",
    status: "failed",
    totalCents: 1084,
    errorCode: "PAYMENT_STATE_UNKNOWN",
  });
}

await givenEnabledCard_whenRouted_thenUsesNewSliceWithZeroLegacyCalls();
await givenGiftCard_whenRouted_thenStaysOnLegacy();
await givenInvoice_whenRouted_thenStaysOnLegacy();
await givenUnknownPaymentType_whenRouted_thenStaysOnLegacy();
await givenCardSliceDisabled_whenCardRouted_thenUsesLegacyOnly();
await givenPreAuthorizationFailure_whenCardThrows_thenFallsBackToLegacyOnce();
await givenAuthorizationCreatedTrue_whenCardThrows_thenNeverCallsLegacy();
await givenMissingAuthorizationCreated_whenCardThrows_thenNeverCallsLegacy();
await givenAmbiguousError_whenCardThrows_thenNeverCallsLegacy();

console.log("PASS participant strangler route tests");
