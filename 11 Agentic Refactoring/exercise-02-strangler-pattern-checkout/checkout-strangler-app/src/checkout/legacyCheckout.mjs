function totalCents(request) {
  return request.subtotalCents + Math.round(request.subtotalCents * request.taxRateBps / 10000);
}

export function createLegacyCheckout({ authorize }) {
  return async function legacyCheckout(request) {
    const total = totalCents(request);
    if (request.paymentType !== "card") {
      return { orderId: request.orderId, status: "paid", totalCents: total, errorCode: null };
    }
    const authorization = await authorize({
      orderId: request.orderId,
      amountCents: total,
      paymentToken: request.paymentToken,
    });
    return authorization.approved
      ? { orderId: request.orderId, status: "paid", totalCents: total, errorCode: null }
      : { orderId: request.orderId, status: "failed", totalCents: total, errorCode: "PAYMENT_DECLINED" };
  };
}
