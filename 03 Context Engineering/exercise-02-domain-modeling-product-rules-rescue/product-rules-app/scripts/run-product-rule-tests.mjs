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

const vite = await createServer({ root: process.cwd(), appType: "custom", logLevel: "silent", server: { middlewareMode: true } });
try {
  const { canExportAIHistory } = await vite.ssrLoadModule("/src/services/aiHistoryExportPolicy.ts");
  await test("allows an active Enterprise workspace admin", () => assert.equal(canExportAIHistory(workspace(), membership()), true));
  await test("blocks a Growth workspace", () => assert.equal(canExportAIHistory(workspace({ plan: "Growth" }), membership()), false));
  await test("blocks restricted data residency", () => assert.equal(canExportAIHistory(workspace({ dataResidency: "restricted" }), membership()), false));
  await test("blocks a suspended membership", () => assert.equal(canExportAIHistory(workspace(), membership({ status: "suspended" })), false));
  await test("blocks a non-admin membership", () => assert.equal(canExportAIHistory(workspace(), membership({ role: "member" })), false));
  await test("blocks an admin membership from another workspace", () => assert.equal(canExportAIHistory(workspace(), membership({ workspaceId: "ws-blue" })), false));
} finally {
  await vite.close();
}

if (failures.length) {
  console.error(`\n${passed} passed, ${failures.length} failed.`);
  process.exit(1);
}
console.log(`\n${passed} product-rule checks passed.`);
