function totalCents(request) {
  return request.subtotalCents + Math.round(request.subtotalCents * request.taxRateBps / 10000);
}

function usesEnabledCardSlice(request, implementations) {
  return request.paymentType === "card" && implementations.cardSliceEnabled === true;
}

function isValidPublicResult(result) {
  return result != null
    && typeof result === "object"
    && "orderId" in result
    && "status" in result
    && "totalCents" in result
    && "errorCode" in result;
}

function unknownPaymentState(request) {
  return {
    orderId: request.orderId,
    status: "failed",
    totalCents: totalCents(request),
    errorCode: "PAYMENT_STATE_UNKNOWN",
  };
}

export async function routeCheckout(request, implementations) {
  if (!usesEnabledCardSlice(request, implementations)) {
    return implementations.legacy(request);
  }

  try {
    return await implementations.card(request);
  } catch (error) {
    if (error != null && error.authorizationCreated === false) {
      return implementations.legacy(request);
    }
    if (isValidPublicResult(error?.result)) {
      return error.result;
    }
    return unknownPaymentState(request);
  }
}
