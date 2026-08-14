import assert from "node:assert/strict";
import fs from "node:fs";
import { parseSkill, rawSha256, scoreResultSet, sha256, validateCandidateSkill, validateResultSet } from "./trigger-evaluation.mjs";

const evalCases = JSON.parse(fs.readFileSync("evals/trigger-evals.json", "utf8")).cases;
const baseline = parseSkill(fs.readFileSync("fixtures/change-review-baseline/SKILL.md", "utf8"));
const candidate = parseSkill(`---
name: change-review
description: Use for evidence-backed review of a supplied diff, branch, commit, pull request, patch, or other code change to identify defects, regressions, correctness problems, and merge risk. Do not use for implementing or debugging changes, writing summaries or release notes, reviewing designs, or reporting incidents.
---

# Change Review

Inspect the supplied code change and report actionable findings with file and line evidence.
`);

assert.deepEqual(validateCandidateSkill(candidate, baseline, evalCases), []);
const result = {
  schema_version: 1,
  skill_name: "change-review",
  description_sha256: sha256(candidate.description),
  environment: {
    provider: "local-self-test",
    agent: "framework-self-test",
    model: "deterministic-fixture",
    runtime: "node-test",
    settings: { temperature: "not-applicable" },
    repository_commit: "0123456789abcdef0123456789abcdef01234567",
  },
  cases: evalCases.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    decisions: [1, 2, 3].map((run) => {
      const rawResponse = item.expected ? "Selected skill: change-review" : "Selected skills: none";
      return {
        run,
        timestamp: `2026-01-01T00:00:0${run}.000Z`,
        selected_skills: item.expected ? ["change-review"] : [],
        triggered: item.expected,
        raw_response: rawResponse,
        response_sha256: rawSha256(rawResponse),
        observation: "synthetic framework decision",
      };
    }),
  })),
};

assert.deepEqual(validateResultSet("self-test", result, evalCases), []);
const scores = scoreResultSet(result, evalCases);
for (const split of ["train", "held_out", "overall"]) {
  assert.equal(scores[split].case_accuracy, 1);
  assert.equal(scores[split].decision_accuracy, 1);
  assert.equal(scores[split].unanimous_rate, 1);
}

const incomplete = structuredClone(result);
incomplete.cases.pop();
assert.ok(validateResultSet("incomplete", incomplete, evalCases).some((failure) => failure.includes("is missing")));
console.log("trigger evaluation framework self-test passed");
