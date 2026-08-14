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

const billingCustomer = (overrides = {}) => ({
  id: "cust-atlas",
  ownerUserId: "user-billing-owner",
  ...overrides,
});

const workspace = (overrides = {}) => ({
  id: "ws-red",
  billingCustomerId: "cust-atlas",
  plan: "Enterprise",
  dataResidency: "standard",
  ...overrides,
});

const membership = (overrides = {}) => ({
  workspaceId: "ws-red",
  userId: "user-rina",
  role: "admin",
  status: "active",
  ...overrides,
});

const authorization = (overrides = {}) => ({
  callerUserId: "user-rina",
  billingCustomer: billingCustomer(),
  workspace: workspace(),
  membership: membership(),
  ...overrides,
});

const vite = await createServer({
  root: process.cwd(),
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const { canExportAIHistory } = await vite.ssrLoadModule("/src/services/aiHistoryExportPolicy.ts");

  await test("allows the requesting user with an active admin membership in an eligible workspace", () => {
    assert.equal(canExportAIHistory(authorization()), true);
  });

  await test("blocks a Growth workspace", () => {
    assert.equal(canExportAIHistory(authorization({ workspace: workspace({ plan: "Growth" }) })), false);
  });

  await test("blocks restricted data residency", () => {
    assert.equal(canExportAIHistory(authorization({ workspace: workspace({ dataResidency: "restricted" }) })), false);
  });

  await test("blocks a suspended membership", () => {
    assert.equal(canExportAIHistory(authorization({ membership: membership({ status: "suspended" }) })), false);
  });

  await test("blocks a non-admin membership", () => {
    assert.equal(canExportAIHistory(authorization({ membership: membership({ role: "member" }) })), false);
  });

  await test("blocks an admin membership from another workspace", () => {
    assert.equal(canExportAIHistory(authorization({ membership: membership({ workspaceId: "ws-blue" }) })), false);
  });

  await test("blocks an admin membership belonging to another user", () => {
    assert.equal(canExportAIHistory(authorization({ membership: membership({ userId: "user-mateo" }) })), false);
  });

  await test("blocks a billing owner without workspace membership", () => {
    assert.equal(
      canExportAIHistory(
        authorization({
          callerUserId: "user-billing-owner",
          membership: null,
        }),
      ),
      false,
    );
  });
} finally {
  await vite.close();
}

if (failures.length) {
  console.error(`\n${passed} passed, ${failures.length} failed.`);
  process.exit(1);
}

console.log(`\n${passed} product-rule checks passed.`);
process.exit(0);
