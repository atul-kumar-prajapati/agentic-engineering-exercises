import { expect, test } from "@playwright/test";

test("completes checkout using the generated button class", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.locator(".checkout-primary-0").click({ timeout: 2_000 });
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible({ timeout: 3_000 });
});

test("payment authorization is approved", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Pay/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible({ timeout: 3_000 });
});
