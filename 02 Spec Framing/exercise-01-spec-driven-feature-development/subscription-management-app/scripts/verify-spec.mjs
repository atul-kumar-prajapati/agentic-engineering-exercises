import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const specs = path.join(appRoot, "specs");
for (const file of ["clarifications.md", "spec.md", "plan.md", "tasks.md"]) {
  assert.ok(existsSync(path.join(specs, file)), `specs/${file} is required`);
}
const clarifications = readFileSync(path.join(specs, "clarifications.md"), "utf8");
const questions = clarifications.match(/^## Question\s+\d+/gm) ?? [];
assert.ok(questions.length >= 3 && questions.length <= 5, "clarifications must contain three to five numbered questions");
assert.equal((clarifications.match(/^- Assumption:/gm) ?? []).length, questions.length, "every question needs an assumption");
assert.equal((clarifications.match(/^- Consequence:/gm) ?? []).length, questions.length, "every question needs a consequence");
for (const boundary of ["authoriz", "billing", "fail", "scope"]) {
  assert.match(clarifications.toLowerCase(), new RegExp(boundary), `clarifications must address ${boundary}`);
}
console.log("Clarifications, assumptions, consequences, and Spec Kit artifacts verified.");
