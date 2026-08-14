import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyVisualizationSubmission } from "./visualization-verification.mjs";

const exerciseRoot = path.resolve(process.cwd(), "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: process.cwd(), encoding: "utf8" }).trim();
const failures = await verifyVisualizationSubmission({ repositoryRoot, exerciseRoot });
if (failures.length) {
  console.error(`Payment visualization verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("Verified four Mermaid views, exact source markers, payment semantics, contradiction decisions, source SHA, and evidence hashes.");
