import { readFile } from "node:fs/promises";
import { selectSkill } from "./local-select.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const catalog = await readJson("../generated/skill-catalog.json");
const cases = await readJson("./cases.json");
const results = cases.map((testCase) => ({ ...testCase, actual: selectSkill(testCase.request, catalog) }));
const correct = results.filter((result) => result.actual === result.expected).length;
const selected = results.filter((result) => result.actual !== "NONE");
const expectedSelected = results.filter((result) => result.expected !== "NONE");
const truePositive = results.filter((result) => result.actual === result.expected && result.expected !== "NONE").length;
const report = {
  cases: results.length,
  accuracy: correct / results.length,
  precision: selected.length ? truePositive / selected.length : 0,
  recall: expectedSelected.length ? truePositive / expectedSelected.length : 0,
  confusionCases: results.filter((result) => result.actual !== result.expected).map(({ id, expected, actual, kind }) => ({ id, expected, actual, kind })),
  humanReviewThreshold: "NONE or tied top score",
};
console.log(JSON.stringify(report, null, 2));
if (report.accuracy < 0.6) process.exitCode = 1;
