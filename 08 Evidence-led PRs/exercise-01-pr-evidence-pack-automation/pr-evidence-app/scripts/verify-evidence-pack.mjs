import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "fixtures", "check-results.json"), "utf8"));
const evidencePath = path.join(root, "evidence", "pr-evidence.json");
const workflowPath = path.join(root, ".github", "workflows", "pr-evidence.yml");
assert.ok(fs.existsSync(evidencePath), "missing evidence/pr-evidence.json");
assert.ok(fs.existsSync(workflowPath), "missing .github/workflows/pr-evidence.yml");
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
assert.match(evidence.commitSha ?? "", /^[0-9a-f]{7,40}$/i, "evidence must identify a commit SHA");
for (const expected of fixture) {
  const actual = evidence.checks?.find((check) => check.name === expected.name);
  assert.ok(actual, `missing check evidence: ${expected.name}`);
  assert.equal(actual.exitCode, expected.exitCode, `${expected.name} exit code was rewritten`);
  assert.equal(actual.result, expected.result, `${expected.name} result was rewritten`);
  assert.ok(actual.outputPath && actual.digest, `${expected.name} needs output path and digest`);
}
assert.ok(evidence.risk && evidence.rollback && evidence.reviewerAction, "risk, rollback, and reviewer action are required");
const workflow = fs.readFileSync(workflowPath, "utf8");
for (const token of ["permissions:", "contents: read", "if: always()", "actions/upload-artifact", "retention-days", "github.sha"]) assert.ok(workflow.includes(token), `workflow missing ${token}`);
console.log("PR evidence preserves provenance, failures, artifact references, risk, and rollback.");
