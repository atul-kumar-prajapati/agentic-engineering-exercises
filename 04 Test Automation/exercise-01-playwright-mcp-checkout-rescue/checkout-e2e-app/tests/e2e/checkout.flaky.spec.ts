import { expect, test } from "@playwright/test";

// Seeded false confidence: neither test resets the server-side authorization
// counter, so order, repeats, and worker scheduling change the outcome.
test("approves a normal card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pay/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
});

test("recovers from a declined card", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Card number").fill("4000000000000000");
  await page.getByRole("button", { name: /Pay/ }).click();
  await expect(page.getByRole("heading", { name: "Payment declined" })).toBeVisible();
  await page.getByRole("button", { name: "Try another payment" }).click();
  await page.getByLabel("Card number").fill("4242424242424242");
  await page.getByRole("button", { name: /Pay/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
});
