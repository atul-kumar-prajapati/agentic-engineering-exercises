function totalCents(request) {
  return request.subtotalCents + Math.round(request.subtotalCents * request.taxRateBps / 10000);
}

function publicResult(request, total, status, errorCode) {
  return {
    orderId: request.orderId,
    status,
    totalCents: total,
    errorCode,
  };
}

function paidResult(request, total) {
  return publicResult(request, total, "paid", null);
}

function declinedResult(request, total) {
  return publicResult(request, total, "failed", "PAYMENT_DECLINED");
}

function unknownResult(request, total) {
  return publicResult(request, total, "failed", "PAYMENT_STATE_UNKNOWN");
}

function attachAuthorizationSafety(failure, authorizationCreated, request, total) {
  if (failure && typeof failure === "object") {
    if (authorizationCreated && !("authorizationCreated" in failure)) {
      failure.authorizationCreated = true;
    }
    if (failure.result == null) {
      failure.result = unknownResult(request, total);
    }
    return failure;
  }
  return {
    authorizationCreated,
    result: unknownResult(request, total),
    cause: failure,
  };
}

export function createCardCheckout({ authorize }) {
  return async function cardCheckout(request) {
    const total = totalCents(request);
    let authorizationCreated = false;
    try {
      const authorization = await authorize({
        orderId: request.orderId,
        amountCents: total,
        paymentToken: request.paymentToken,
      });
      authorizationCreated = true;
      return authorization.approved
        ? paidResult(request, total)
        : declinedResult(request, total);
    } catch (failure) {
      throw attachAuthorizationSafety(failure, authorizationCreated, request, total);
    }
  };
}
