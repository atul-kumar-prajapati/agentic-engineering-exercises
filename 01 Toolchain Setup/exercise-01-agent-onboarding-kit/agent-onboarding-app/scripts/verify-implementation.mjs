import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const appRoot = path.resolve(import.meta.dirname, "..");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function collectSourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSourceFiles(absolutePath));
    if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(absolutePath);
  }
  return files;
}

function caseFixture(id, overrides = {}) {
  return {
    id,
    customer: id,
    segment: "mid-market",
    severity: "medium",
    status: "new",
    ownerTeam: "support-platform",
    lastActivityHours: 1,
    revenueRiskUsd: 1,
    tags: [],
    summary: "Verification fixture",
    ...overrides
  };
}

const appSource = readFileSync(path.join(appRoot, "src", "App.tsx"), "utf8");
const routerSource = readFileSync(path.join(appRoot, "src", "services", "caseRouter.ts"), "utf8");
const source = collectSourceFiles(path.join(appRoot, "src"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

check(/needs[ -]attention/i.test(appSource), "App.tsx must provide a Needs Attention filter");
check(appSource.includes("visibleCases.length"), "the displayed count must come from the visible case list");
for (const status of ["all", "new", "triaged", "waiting", "blocked"]) {
  check(appSource.includes(`"${status}"`), `the existing ${status} filter must remain available`);
}

const staleDefinitions = [...source.matchAll(/staleAfterHours\s*:\s*\d+/g)];
const revenueDefinitions = [...source.matchAll(/criticalRevenueFloor\s*:\s*\d+/g)];
check(staleDefinitions.length === 1, "staleAfterHours must have one numeric source of truth in src");
check(revenueDefinitions.length === 1, "criticalRevenueFloor must have one numeric source of truth in src");
check(!routerSource.includes("defaultPolicyMirror"), "remove the duplicated defaultPolicyMirror policy");

let routingModule;
let dataModule;
const vite = await createServer({
  root: appRoot,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true }
});

try {
  routingModule = await vite.ssrLoadModule("/src/services/caseRouter.ts");
  dataModule = await vite.ssrLoadModule("/src/data/cases.ts");
} catch (error) {
  failures.push(`could not load the routing modules: ${error.message}`);
} finally {
  await vite.close();
}

if (routingModule && dataModule) {
  const standardPolicy = {
    staleAfterHours: 18,
    criticalRevenueFloor: 75000,
    defaultOwner: "support-platform",
    restrictedTags: []
  };
  const stricterPolicy = {
    ...standardPolicy,
    staleAfterHours: 30,
    criticalRevenueFloor: 100000
  };
  const predicateCases = [
    [caseFixture("normal"), standardPolicy, false],
    [caseFixture("stale", { lastActivityHours: 18 }), standardPolicy, true],
    [caseFixture("revenue", { revenueRiskUsd: 75000 }), standardPolicy, true],
    [caseFixture("below-stricter", { lastActivityHours: 20, revenueRiskUsd: 80000 }), stricterPolicy, false]
  ];
  const expectedSignals = predicateCases.map(([, , expected]) => expected);
  const matchingSignals = [];

  for (const [functionName, candidate] of Object.entries(routingModule)) {
    if (typeof candidate !== "function") continue;
    try {
      const results = predicateCases.map(([item, policy]) => candidate(item, policy));
      if (
        results.every((result) => typeof result === "boolean") &&
        results.every((result, index) => result === expectedSignals[index])
      ) {
        matchingSignals.push({ functionName, propertyName: null, evaluate: candidate });
        continue;
      }

      const propertyNames = Object.keys(results[0] ?? {});
      for (const propertyName of propertyNames) {
        const propertyResults = results.map((result) => result?.[propertyName]);
        if (
          propertyResults.every((result) => typeof result === "boolean") &&
          propertyResults.every((result, index) => result === expectedSignals[index])
        ) {
          matchingSignals.push({
            functionName,
            propertyName,
            evaluate: (item, policy) => candidate(item, policy)[propertyName]
          });
        }
      }
    } catch {
      // This export has a different purpose or signature.
    }
  }

  check(matchingSignals.length > 0, "provide one reusable routing decision for Needs Attention cases");
  check(
    matchingSignals.some(
      ({ functionName, propertyName }) =>
        appSource.includes(functionName) && (!propertyName || appSource.includes(propertyName))
    ),
    "App.tsx must use the shared Needs Attention routing decision"
  );

  if (typeof routingModule.sortCasesForTriage !== "function") {
    failures.push("sortCasesForTriage must remain available");
  } else {
    const staleCase = caseFixture("stale", { lastActivityHours: 20 });
    const revenueCase = caseFixture("revenue", { revenueRiskUsd: 80000 });
    const standardOrder = routingModule
      .sortCasesForTriage([staleCase, revenueCase], standardPolicy)
      .map((item) => item.id);
    const stricterOrder = routingModule
      .sortCasesForTriage([staleCase, revenueCase], {
        ...stricterPolicy,
        staleAfterHours: 10
      })
      .map((item) => item.id);
    check(standardOrder[0] === "revenue", "sorting must apply the supplied revenue-risk rule");
    check(stricterOrder[0] === "stale", "sorting must apply the supplied stale-case rule");
  }

  if (matchingSignals.length > 0) {
    const predicate = matchingSignals[0].evaluate;
    const attentionIds = dataModule.sampleCases
      .filter((item) => predicate(item, dataModule.queuePolicy))
      .map((item) => item.id);
    check(
      JSON.stringify(attentionIds) === JSON.stringify(["CASE-1842", "CASE-1851"]),
      "the sample data must identify CASE-1842 and CASE-1851 as Needs Attention"
    );
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Needs Attention implementation verified.");
