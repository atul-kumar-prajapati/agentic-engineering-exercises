import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "replay-cases.json"), "utf8"));
const resultPath = path.resolve(root, "..", "evidence", "benchmark.json");
assert.ok(fs.existsSync(resultPath), "missing evidence/benchmark.json");
const results = JSON.parse(fs.readFileSync(resultPath, "utf8")).runs ?? [];
for (const item of cases) for (const lane of ["baseline", "candidate"]) {
  const runs = results.filter((run) => run.caseId === item.id && run.lane === lane);
  assert.equal(runs.length, 3, `${item.id}/${lane} needs exactly three runs`);
  for (const run of runs) {
    assert.ok(run.model && Number.isFinite(run.tokens) && Number.isFinite(run.durationMs), `${item.id}/${lane} needs model, tokens, and time`);
    assert.ok(Array.isArray(run.assertions) && run.assertions.every((grade) => typeof grade.passed === "boolean" && grade.evidence), `${item.id}/${lane} needs evidence-backed grades`);
  }
}
function score(split, lane) {
  const ids = new Set(cases.filter((item) => item.split === split).map((item) => item.id));
  const grades = results.filter((run) => ids.has(run.caseId) && run.lane === lane).flatMap((run) => run.assertions);
  return grades.filter((grade) => grade.passed).length / grades.length;
}
assert.ok(score("heldout", "candidate") > score("heldout", "baseline"), "candidate must improve held-out quality");
const criticalIds = new Set(cases.flatMap((item) => item.assertions.filter((a) => a.critical).map((a) => `${item.id}:${a.id}`)));
const criticalFailures = results.filter((run) => run.lane === "candidate").flatMap((run) => run.assertions.map((grade) => ({ ...grade, caseId: run.caseId }))).filter((grade) => criticalIds.has(`${grade.caseId}:${grade.id}`) && !grade.passed);
assert.equal(criticalFailures.length, 0, "candidate has a critical assertion regression");
console.log("Workflow candidate improves held-out quality with complete repeated evidence and no critical regression.");
