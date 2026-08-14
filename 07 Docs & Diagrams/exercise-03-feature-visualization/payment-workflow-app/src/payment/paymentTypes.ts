export type Currency = "USD";

export interface Money {
  cents: number;
  currency: Currency;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  billingCountry: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: Money;
}

export interface CheckoutOrder {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: Money;
  tax: Money;
  total: Money;
  status: "draft" | "payment_pending" | "paid" | "payment_failed";
}

export interface PaymentMethod {
  id: string;
  type: "card";
  network: "visa" | "mastercard";
  last4: string;
  billingCountry: string;
  riskScore: number;
}

export type PaymentIntentStatus = "created" | "authorized" | "captured" | "declined" | "failed";

export interface PaymentIntent {
  id: string;
  orderId: string; // VIS: VIS-12
  customerId: string;
  paymentMethodId: string;
  amount: Money;
  status: PaymentIntentStatus;
  idempotencyKey: string;
  gatewayReference?: string;
  failureReason?: string;
}

export interface GatewayTransaction {
  id: string;
  intentId: string; // VIS: VIS-13
  gatewayReference: string;
  type: "authorization" | "capture";
  amount: Money;
  status: "approved" | "declined" | "settled";
  message: string;
}

export interface LedgerEntry {
  id: string;
  orderId: string;
  paymentIntentId: string; // VIS: VIS-14
  type: "authorization_hold" | "capture" | "payment_failed";
  amount: Money;
  status: "posted" | "rejected";
}

export interface WebhookEvent {
  id: string;
  gatewayReference: string; // VIS: VIS-15
  type: "payment.captured" | "payment.declined";
  signatureValid: boolean;
  handled: boolean;
}

export interface Receipt {
  id: string;
  orderId: string; // VIS: VIS-16
  customerEmail: string;
  status: "queued" | "sent" | "blocked";
}

export interface PaymentEvent {
  id: string;
  source: "Checkout UI" | "Payment Orchestrator" | "Gateway Adapter" | "Ledger" | "Notifier" | "Webhook Handler";
  label: string;
  evidence: string;
}

export interface PaymentRecord {
  customer: Customer;
  order: CheckoutOrder;
  paymentMethod: PaymentMethod;
  intent: PaymentIntent;
  authorization?: GatewayTransaction;
  capture?: GatewayTransaction;
  ledgerEntries: LedgerEntry[];
  webhookEvents: WebhookEvent[];
  receipt: Receipt;
  timeline: PaymentEvent[];
}
