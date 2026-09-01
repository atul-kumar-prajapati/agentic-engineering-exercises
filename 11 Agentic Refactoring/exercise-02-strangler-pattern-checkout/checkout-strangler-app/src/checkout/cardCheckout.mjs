const BASIS_POINTS_PER_UNIT = 10000;

function taxCentsFromSubtotal(subtotalCents, taxRateBps) {
  return Math.round((subtotalCents * taxRateBps) / BASIS_POINTS_PER_UNIT);
}

function amountCentsFromRequest(request) {
  return request.subtotalCents + taxCentsFromSubtotal(request.subtotalCents, request.taxRateBps);
}

function mapAuthorizationToPublicResult(orderId, amountCents, authorization) {
  if (authorization != null && authorization.approved === true) {
    return { orderId, status: "paid", totalCents: amountCents, errorCode: null };
  }
  return { orderId, status: "failed", totalCents: amountCents, errorCode: "PAYMENT_DECLINED" };
}

export function createCardCheckout({ authorize }) {
  if (typeof authorize !== "function") {
    throw new TypeError("createCardCheckout requires an injectable authorize function");
  }

  return async function cardCheckout(request) {
    const amountCents = amountCentsFromRequest(request);
    const authorization = await authorize({
      orderId: request.orderId,
      amountCents,
      paymentToken: request.paymentToken,
    });
    return mapAuthorizationToPublicResult(request.orderId, amountCents, authorization);
  };
}
