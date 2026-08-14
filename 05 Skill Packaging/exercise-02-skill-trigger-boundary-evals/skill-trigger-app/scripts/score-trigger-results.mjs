import fs from "node:fs";
import path from "node:path";
import { scoreResultSet, validateResultSet } from "./trigger-evaluation.mjs";

const resultArgument = process.argv[2];
if (!resultArgument) throw new Error("Usage: npm run eval:score -- <result-file.json>");

const cases = JSON.parse(fs.readFileSync(path.resolve("evals/trigger-evals.json"), "utf8")).cases;
const resultPath = path.resolve(resultArgument);
const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
const failures = validateResultSet(path.basename(resultPath), result, cases);
if (failures.length) {
  console.error("Trigger result validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(scoreResultSet(result, cases), null, 2));
