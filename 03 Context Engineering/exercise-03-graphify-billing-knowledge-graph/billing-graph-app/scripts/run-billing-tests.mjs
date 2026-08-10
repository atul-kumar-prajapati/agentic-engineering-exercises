import assert from "node:assert/strict";
import { createServer } from "vite";

const failures = [];
let passed = 0;
const test = async (name, action) => {
  try {
    await action();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}\n  ${error.message}`);
  }
};
const vite = await createServer({ root: process.cwd(), appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
try {
  const { recognizedRevenueByAccount } = await vite.ssrLoadModule("/src/billing/recognizedRevenue.ts");
  const links = [
    { tenantId: "tenant-red", billingAccountId: "acct-atlas" },
    { tenantId: "tenant-blue", billingAccountId: "acct-atlas" },
    { tenantId: "tenant-green", billingAccountId: "acct-cedar" },
  ];
  await test("subtracts credits from charge revenue", () => {
    assert.deepEqual(recognizedRevenueByAccount([{ tenantId: "tenant-red", grossAmount: 120, credits: 20, kind: "charge" }], links), { "acct-atlas": 100 });
  });
  await test("groups multiple tenants under the billing account", () => {
    const result = recognizedRevenueByAccount([
      { tenantId: "tenant-red", grossAmount: 100, credits: 10, kind: "charge" },
      { tenantId: "tenant-blue", grossAmount: 50, credits: 5, kind: "charge" },
    ], links);
    assert.deepEqual(result, { "acct-atlas": 135 });
  });
  await test("subtracts refunds from recognized revenue", () => {
    const result = recognizedRevenueByAccount([
      { tenantId: "tenant-green", grossAmount: 90, credits: 0, kind: "charge" },
      { tenantId: "tenant-green", grossAmount: 15, credits: 0, kind: "refund" },
    ], links);
    assert.deepEqual(result, { "acct-cedar": 75 });
  });
  await test("rejects an event without a tenant-to-account mapping", () => {
    assert.throws(() => recognizedRevenueByAccount([{ tenantId: "tenant-missing", grossAmount: 20, credits: 0, kind: "charge" }], links), /mapping/i);
  });
  await test("does not mutate input events or links", () => {
    const events = [{ tenantId: "tenant-red", grossAmount: 30, credits: 2, kind: "charge" }];
    const copy = structuredClone({ events, links });
    recognizedRevenueByAccount(events, links);
    assert.deepEqual({ events, links }, copy);
  });
} finally {
  await vite.close();
}
if (failures.length) {
  console.error(`\n${passed} passed, ${failures.length} failed.`);
  process.exit(1);
}
console.log(`\n${passed} billing checks passed.`);
