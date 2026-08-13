import assert from "node:assert/strict";
import { createServer } from "vite";

const failures = [];
let passed = 0;

async function test(name, action) {
  try {
    await action();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}\n  ${error.message}`);
  }
}

const links = [
  { tenantId: "tenant-red", billingAccountId: "acct-atlas" },
  { tenantId: "tenant-blue", billingAccountId: "acct-atlas" },
  { tenantId: "tenant-green", billingAccountId: "acct-cedar" },
];

const vite = await createServer({
  root: process.cwd(),
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const revenue = await vite.ssrLoadModule("/src/billing/recognizedRevenue.ts");
  const gross = await vite.ssrLoadModule("/src/billing/grossVolume.ts");
  const dashboard = await vite.ssrLoadModule("/src/dashboard/loadRevenueDashboard.ts");
  const snapshot = await vite.ssrLoadModule("/src/jobs/publishRevenueSnapshot.ts");

  await test("subtracts credits from charge revenue", () => {
    const result = revenue.recognizedRevenueByAccount(
      [{ tenantId: "tenant-red", grossAmount: 120, credits: 20, kind: "charge" }],
      links,
    );
    assert.deepEqual(result, { "acct-atlas": 100 });
  });

  await test("subtracts refund gross without applying credits twice", () => {
    const result = revenue.recognizedRevenueByAccount(
      [
        { tenantId: "tenant-green", grossAmount: 90, credits: 10, kind: "charge" },
        { tenantId: "tenant-green", grossAmount: 15, credits: 4, kind: "refund" },
      ],
      links,
    );
    assert.deepEqual(result, { "acct-cedar": 65 });
  });

  await test("groups multiple tenants under one billing account", () => {
    const result = revenue.recognizedRevenueByAccount(
      [
        { tenantId: "tenant-red", grossAmount: 100, credits: 10, kind: "charge" },
        { tenantId: "tenant-blue", grossAmount: 50, credits: 5, kind: "charge" },
      ],
      links,
    );
    assert.deepEqual(result, { "acct-atlas": 135 });
  });

  await test("rejects an event without an account mapping", () => {
    assert.throws(
      () =>
        revenue.recognizedRevenueByAccount(
          [{ tenantId: "tenant-missing", grossAmount: 20, credits: 0, kind: "charge" }],
          links,
        ),
      /mapping/i,
    );
  });

  await test("does not mutate events or account links", () => {
    const events = [{ tenantId: "tenant-red", grossAmount: 30, credits: 2, kind: "charge" }];
    const original = structuredClone({ events, links });
    revenue.recognizedRevenueByAccount(events, links);
    assert.deepEqual({ events, links }, original);
  });

  await test("keeps the dashboard on the shared corrected summary", () => {
    const result = dashboard.loadRevenueDashboard(
      [{ tenantId: "tenant-red", grossAmount: 40, credits: 5, kind: "charge" }],
      links,
    );
    assert.deepEqual(result.metrics.recognizedRevenueByAccount, { "acct-atlas": 35 });
  });

  await test("keeps the scheduled snapshot on the shared corrected summary", () => {
    const result = snapshot.publishRevenueSnapshot(
      [{ tenantId: "tenant-blue", grossAmount: 60, credits: 10, kind: "charge" }],
      links,
    );
    assert.deepEqual(result.metrics.recognizedRevenueByAccount, { "acct-atlas": 50 });
  });

  await test("preserves the existing gross-volume metric", () => {
    const events = [
      { tenantId: "tenant-red", grossAmount: 100, credits: 25, kind: "charge" },
      { tenantId: "tenant-blue", grossAmount: 20, credits: 0, kind: "refund" },
    ];
    assert.deepEqual(gross.grossVolumeByAccount(events, links), { "acct-atlas": 120 });
  });
} finally {
  await vite.close();
}

if (failures.length) {
  console.error(`\n${passed} passed, ${failures.length} failed.`);
  process.exit(1);
}

console.log(`\n${passed} billing checks passed.`);
