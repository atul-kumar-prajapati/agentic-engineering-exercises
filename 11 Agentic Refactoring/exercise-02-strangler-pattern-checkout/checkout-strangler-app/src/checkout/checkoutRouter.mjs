function totalCents(request) {
  return request.subtotalCents + Math.round(request.subtotalCents * request.taxRateBps / 10000);
}

function unknownPaymentState(request) {
  return {
    orderId: request.orderId,
    status: "failed",
    totalCents: totalCents(request),
    errorCode: "PAYMENT_STATE_UNKNOWN",
  };
}

function shouldUseCardSlice(request, implementations) {
  return request.paymentType === "card"
    && implementations.cardSliceEnabled === true
    && typeof implementations.card === "function";
}

function canFallbackToLegacy(failure) {
  return Boolean(failure) && failure.authorizationCreated === false;
}

export async function routeCheckout(request, implementations) {
  if (!shouldUseCardSlice(request, implementations)) {
    return implementations.legacy(request);
  }

  try {
    return await implementations.card(request);
  } catch (failure) {
    if (canFallbackToLegacy(failure)) {
      return implementations.legacy(request);
    }
    if (failure && failure.result) {
      return failure.result;
    }
    return unknownPaymentState(request);
  }
}
