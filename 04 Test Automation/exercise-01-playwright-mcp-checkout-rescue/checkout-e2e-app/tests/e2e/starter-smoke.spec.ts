import { expect, test } from "@playwright/test";

test("the documented checkout workflow is mounted and reachable", async ({ page, request }) => {
  await request.post("/api/testing/reset");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Complete checkout" })).toBeVisible();
  await expect(page.getByText("$7.92")).toBeVisible();
  await page.getByRole("button", { name: /Pay/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
});
