import fs from "node:fs";
import { skillManifest } from "./benchmark-lib.mjs";

const data = JSON.parse(fs.readFileSync("evals/evals.json", "utf8"));
if (data.skill_name !== "incident-summary" || data.evals?.length !== 4) throw new Error("expected four incident-summary evals");
for (const split of ["train", "held-out"]) if (data.evals.filter((item) => item.split === split).length !== 2) throw new Error(`expected two ${split} evals`);
const ids = new Set();
for (const item of data.evals) {
  if (ids.has(item.id)) throw new Error(`duplicate eval ${item.id}`);
  ids.add(item.id);
  if (!item.name || item.prompt?.length < 100 || item.files?.length !== 1 || item.expectations?.length !== 5) throw new Error(`eval ${item.id} is incomplete`);
  if (item.expectations.filter((expectation) => expectation.critical).length !== 2) throw new Error(`eval ${item.id} needs exactly two critical assertions`);
  const expectationIds = new Set();
  for (const expectation of item.expectations) {
    if (expectationIds.has(expectation.id)) throw new Error(`eval ${item.id} has duplicate expectation ${expectation.id}`);
    expectationIds.add(expectation.id);
    if (!expectation.text || !Array.isArray(expectation.checks) || !expectation.checks.length) throw new Error(`expectation ${expectation.id} is incomplete`);
    for (const check of expectation.checks) if (!["contains_all", "contains_any", "not_matches"].includes(check.type)) throw new Error(`expectation ${expectation.id} has unsupported check ${check.type}`);
  }
  for (const relative of item.files) if (!fs.existsSync(relative)) throw new Error(`missing ${relative}`);
}
const starter = skillManifest("fixtures/incident-summary-starter");
console.log(`Benchmark fixtures contain four train/held-out tasks. Starter skill tree SHA-256: ${starter.tree_sha256}`);
