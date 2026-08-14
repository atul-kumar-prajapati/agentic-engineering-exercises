import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { assertScenario, executeScenario, FLAG_KEY, sha256 } from "./rollout-harness.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const scenarioId = argument("--scenario");
const sourceSha = argument("--sha");
const output = path.resolve(argument("--output"));
assert.match(sourceSha, /^[a-f0-9]{40}$/, "--sha must be a full Git SHA");
const configPath = path.resolve("config/invoice-preview.json");
const scenariosPath = path.resolve("fixtures/rollout-scenarios.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const fixtures = JSON.parse(fs.readFileSync(scenariosPath, "utf8"));
const scenario = fixtures.scenarios.find((item) => item.id === scenarioId);
assert.ok(scenario, `Unknown scenario ${scenarioId}`);
const result = await executeScenario({ config, context: scenario.context, providerError: scenario.providerError });
assertScenario(result, scenario.expected);
const document = {
  schemaVersion: 1,
  sourceSha,
  scenario: scenario.id,
  flagKey: FLAG_KEY,
  configSha256: sha256(configPath),
  context: scenario.context,
  evaluation: result.observations.evaluations,
  outcome: result.outcome,
  apiCalls: result.observations.apiCalls,
  telemetry: result.observations.telemetry,
  result: "passed",
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Source SHA: ${sourceSha}`);
console.log(`Scenario: ${scenario.id}`);
console.log(`Experience: ${result.outcome.experience}`);
console.log(`API calls: ${result.observations.apiCalls.length}`);
console.log(`Telemetry events: ${result.observations.telemetry.length}`);
console.log(`PASS captured ${scenario.id} rollout evidence`);
