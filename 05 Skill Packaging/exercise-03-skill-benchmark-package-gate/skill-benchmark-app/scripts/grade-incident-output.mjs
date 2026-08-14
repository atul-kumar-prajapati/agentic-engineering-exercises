import fs from "node:fs";
import path from "node:path";
import { gradeOutput } from "./benchmark-lib.mjs";

const [evalArgument, outputArgument, gradingArgument] = process.argv.slice(2);
if (!evalArgument || !outputArgument || !gradingArgument) throw new Error("Usage: npm run eval:grade -- <eval-id> <output.md> <grading.json>");
const evals = JSON.parse(fs.readFileSync("evals/evals.json", "utf8")).evals;
const evalDefinition = evals.find((item) => item.id === Number(evalArgument));
if (!evalDefinition) throw new Error(`unknown eval ${evalArgument}`);
const output = fs.readFileSync(path.resolve(outputArgument), "utf8");
const gradingPath = path.resolve(gradingArgument);
fs.mkdirSync(path.dirname(gradingPath), { recursive: true });
const grading = gradeOutput(evalDefinition, output);
fs.writeFileSync(gradingPath, JSON.stringify(grading, null, 2) + "\n");
console.log(`Graded eval ${evalDefinition.id}: ${grading.summary.passed}/${grading.summary.total} expectations passed.`);
