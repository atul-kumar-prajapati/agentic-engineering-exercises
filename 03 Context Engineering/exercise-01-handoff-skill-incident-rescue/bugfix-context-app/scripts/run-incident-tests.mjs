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

function fixture(overrides = {}) {
  return {
    id: "fixture",
    name: "Fixture customer",
    priority: "High",
    status: "Queued",
    escalationMode: "none",
    waitingHours: 48,
    score: 70,
    summary: "Regression fixture",
    note: "Existing note",
    owner: "Asha",
    dueInDays: 0,
    tags: ["fixture"],
    ...overrides,
  };
}

const vite = await createServer({
  root: process.cwd(),
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

let policy;
let workflow;
let scoring;

try {
  policy = await vite.ssrLoadModule("/src/services/escalationPolicy.ts");
  workflow = await vite.ssrLoadModule("/src/services/workflowApi.ts");
  scoring = await vite.ssrLoadModule("/src/utils/scoring.ts");
} catch (error) {
  failures.push(`could not load incident modules: ${error.message}`);
}

if (policy && workflow && scoring) {
  await test("keeps a high-priority case queued at 47 waiting hours", () => {
    const original = fixture({ waitingHours: 47 });
    assert.deepEqual(policy.applyAutomaticEscalation(original), original);
  });

  await test("escalates a high-priority case at the 48-hour boundary", () => {
    const result = policy.applyAutomaticEscalation(fixture({ waitingHours: 48 }));
    assert.equal(result.status, "Escalated");
    assert.equal(result.escalationMode, "automatic");
  });

  await test("preserves ownership and case content during automatic escalation", () => {
    const original = fixture({ owner: "Mateo", note: "Do not replace", tags: ["one", "two"] });
    const result = policy.applyAutomaticEscalation(original);
    assert.equal(result.owner, original.owner);
    assert.equal(result.note, original.note);
    assert.deepEqual(result.tags, original.tags);
  });

  await test("leaves an existing manual escalation unchanged", () => {
    const original = fixture({ status: "Escalated", escalationMode: "manual", waitingHours: 80 });
    assert.deepEqual(policy.applyAutomaticEscalation(original), original);
  });

  await test("does not escalate a non-high-priority case", () => {
    const original = fixture({ priority: "Medium", waitingHours: 96 });
    assert.deepEqual(policy.applyAutomaticEscalation(original), original);
  });

  await test("is idempotent after an automatic escalation", () => {
    const once = policy.applyAutomaticEscalation(fixture());
    assert.deepEqual(policy.applyAutomaticEscalation(once), once);
  });

  await test("persists exactly the eligible automatic escalations", async () => {
    workflow.resetWorkflowForTests();
    const updated = await workflow.runAutomaticEscalation();
    const fetched = await workflow.fetchWorkItems();
    assert.deepEqual(fetched, updated);
    assert.deepEqual(
      fetched.filter((item) => item.escalationMode === "automatic").map((item) => item.id),
      ["INC-2047-A", "INC-2047-E"],
    );
    assert.equal(fetched.find((item) => item.id === "INC-2047-A").owner, "Asha");
    assert.equal(fetched.find((item) => item.id === "INC-2047-E").owner, "Asha");
  });

  await test("preserves the manually escalated case in saved state", async () => {
    const fetched = await workflow.fetchWorkItems();
    const manual = fetched.find((item) => item.id === "INC-2047-D");
    assert.equal(manual.status, "Escalated");
    assert.equal(manual.escalationMode, "manual");
    assert.equal(manual.owner, "Nikhil");
  });

  await test("keeps queue totals consistent with saved state", async () => {
    const fetched = await workflow.fetchWorkItems();
    const summary = scoring.summarizePortfolio(fetched);
    assert.equal(summary.blocked, 3);
    assert.equal(fetched.filter((item) => item.status === "Escalated").length, 3);
  });

  await test("does not expose mutable references to saved queue state", async () => {
    workflow.resetWorkflowForTests();
    const fetched = await workflow.fetchWorkItems();
    fetched[0].owner = "Changed outside the API";
    fetched[0].tags.push("mutated");
    const refetched = await workflow.fetchWorkItems();
    assert.equal(refetched[0].owner, "Asha");
    assert.deepEqual(refetched[0].tags, ["customer-visible", "sla-risk"]);
  });
}

await vite.close();

if (failures.length) {
  console.error(`\n${passed} passed, ${failures.length} failed.`);
  process.exit(1);
}

console.log(`\n${passed} incident checks passed.`);
