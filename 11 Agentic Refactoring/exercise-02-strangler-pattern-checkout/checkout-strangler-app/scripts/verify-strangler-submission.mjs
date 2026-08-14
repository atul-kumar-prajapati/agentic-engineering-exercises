import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { validateRouteMatrix, verifyStranglerHistory } from "./strangler-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function text(file) { return fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8") : ""; }
failures.push(...validateRouteMatrix(text("route-matrix.md")));
for (const [file, terms] of [
  ["contract-comparison.md", ["orderId", "status", "totalCents", "errorCode", "round", "approved", "declined"]],
  ["rollback.md", ["cardSliceEnabled", "false", "legacy", "authorizationCreated", "no duplicate"]],
]) for (const term of terms) if (!text(file).toLowerCase().includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
let history = {};
try { history = JSON.parse(text("history.json")); } catch { failures.push("history.json must be valid JSON"); }
if (!/^[a-f0-9]{40}$/.test(history.sourceSha ?? "")) failures.push("sourceSha must be a full commit SHA");
else failures.push(...verifyStranglerHistory({ repositoryRoot, exerciseRoot, sourceSha: history.sourceSha }));
if (failures.length) {
  console.error(`Strangler submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${history.sourceSha}`);
console.log("PASS route, comparison, rollback, and focused-history evidence");
