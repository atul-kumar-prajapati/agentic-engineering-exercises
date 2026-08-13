import { expect, test, type Page, type Route } from "@playwright/test";

const approvedCard = "4242424242424242";
const declinedCard = "4000000000000000";

type Authorization = {
  cardholder: string;
  cardNumber: string;
  total: number;
};

async function mountReadyCheckout(page: Page) {
  const taxRequest = page.waitForRequest("**/api/tax-quote");
  await page.goto("/");
  expect((await taxRequest).postDataJSON()).toEqual({ country: "IN", subtotal: 99 });
  const payButton = page.getByRole("button", { name: "Pay $106.92" });
  await expect(payButton).toBeEnabled();
  await expect(page.getByText("$7.92", { exact: true })).toBeVisible();
  return payButton;
}

test.beforeEach(async ({ request }) => {
  const response = await request.post("/api/testing/reset");
  expect(response.ok()).toBeTruthy();
});

test("approves checkout and sends the quoted total", async ({ page }) => {
  let authorization: Authorization | undefined;
  await page.route("**/api/payments/authorize", async (route) => {
    authorization = route.request().postDataJSON() as Authorization;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "approved", authorizationId: "AUTH-APPROVED" }),
    });
  });

  const payButton = await mountReadyCheckout(page);
  const authorizationRequest = page.waitForRequest("**/api/payments/authorize");
  await payButton.click();
  await authorizationRequest;

  expect(authorization).toEqual({
    cardholder: "Asha Kumar",
    cardNumber: approvedCard,
    total: 106.92,
  });
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText("Authorization AUTH-APPROVED")).toBeVisible();
});

test("recovers from decline with a fresh authorization", async ({ page }) => {
  const authorizations: Authorization[] = [];
  await page.route("**/api/payments/authorize", async (route: Route) => {
    const body = route.request().postDataJSON() as Authorization;
    authorizations.push(body);
    const declined = body.cardNumber === declinedCard;
    await route.fulfill({
      status: declined ? 402 : 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: declined ? "declined" : "approved",
        authorizationId: declined ? null : `AUTH-RETRY-${authorizations.length}`,
      }),
    });
  });

  await mountReadyCheckout(page);
  await page.getByLabel("Card number").fill(declinedCard);
  await page.getByRole("button", { name: "Pay $106.92" }).click();
  await expect(page.getByRole("heading", { name: "Payment declined" })).toBeVisible();

  await page.getByRole("button", { name: "Try another payment" }).click();
  await page.getByLabel("Card number").fill(approvedCard);
  await page.getByRole("button", { name: "Pay $106.92" }).click();

  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  expect(authorizations).toEqual([
    { cardholder: "Asha Kumar", cardNumber: declinedCard, total: 106.92 },
    { cardholder: "Asha Kumar", cardNumber: approvedCard, total: 106.92 },
  ]);
});

test("disables submission while authorization is pending", async ({ page }) => {
  let authorizationCount = 0;
  let releaseAuthorization!: () => void;
  const authorizationPending = new Promise<void>((resolve) => {
    releaseAuthorization = resolve;
  });
  await page.route("**/api/payments/authorize", async (route) => {
    authorizationCount += 1;
    await authorizationPending;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "approved", authorizationId: "AUTH-ONCE" }),
    });
  });

  const payButton = await mountReadyCheckout(page);
  await payButton.click();
  await expect(page.getByRole("button", { name: "Authorizing..." })).toBeDisabled();
  expect(authorizationCount).toBe(1);
  releaseAuthorization();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  expect(authorizationCount).toBe(1);
});
