import type { GatewayTransaction, Money, PaymentMethod, WebhookEvent } from "./paymentTypes";

export interface AuthorizationRequest {
  intentId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export function authorizePayment(request: AuthorizationRequest): GatewayTransaction {
  const declined = request.paymentMethod.riskScore >= 85;
  const gatewayReference = `gw_${request.idempotencyKey.slice(-8)}`;

  return {
    id: `gtx_auth_${request.intentId}`,
    intentId: request.intentId,
    gatewayReference,
    type: "authorization",
    amount: request.amount,
    status: declined ? "declined" : "approved",
    message: declined ? "Card declined by risk rules" : "Authorization approved",
  };
}

export function capturePayment(authorization: GatewayTransaction): GatewayTransaction {
  if (authorization.status !== "approved") {
    throw new Error("Only approved authorizations can be captured");
  }

  return {
    id: authorization.id.replace("auth", "capture"),
    intentId: authorization.intentId,
    gatewayReference: authorization.gatewayReference,
    type: "capture",
    amount: authorization.amount,
    status: "settled",
    message: "Capture settled",
  };
}

export function buildGatewayWebhook(transaction: GatewayTransaction): WebhookEvent {
  return {
    id: `evt_${transaction.gatewayReference}`,
    gatewayReference: transaction.gatewayReference,
    type: transaction.status === "settled" ? "payment.captured" : "payment.declined",
    signatureValid: true,
    handled: true,
  };
}

export function verifyWebhookSignature(event: WebhookEvent, signature: string) {
  return event.signatureValid && signature === `sig_${event.gatewayReference}`;
}
