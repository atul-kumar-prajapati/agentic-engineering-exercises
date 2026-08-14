import type { Customer, OrderItem, PaymentMethod } from "./paymentTypes";

export const demoCustomer: Customer = {
  id: "cus_1042",
  name: "Maya Patel",
  email: "maya.patel@example.com",
  billingCountry: "US",
};

export const demoCart: OrderItem[] = [
  {
    sku: "COURSE-TEAM-50",
    name: "Team training seat bundle",
    quantity: 1,
    unitPrice: { cents: 49000, currency: "USD" },
  },
  {
    sku: "SUPPORT-PRO",
    name: "Priority support add-on",
    quantity: 1,
    unitPrice: { cents: 9900, currency: "USD" },
  },
];

export const approvedCard: PaymentMethod = {
  id: "pm_card_visa_4242",
  type: "card",
  network: "visa",
  last4: "4242",
  billingCountry: "US",
  riskScore: 18,
};

export const declinedCard: PaymentMethod = {
  id: "pm_card_mastercard_0002",
  type: "card",
  network: "mastercard",
  last4: "0002",
  billingCountry: "US",
  riskScore: 91,
};
