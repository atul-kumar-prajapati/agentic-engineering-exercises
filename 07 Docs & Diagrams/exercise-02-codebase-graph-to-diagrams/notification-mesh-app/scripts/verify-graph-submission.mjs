import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyGraphSubmission } from "./graph-verification.mjs";

const appRoot = process.cwd();
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = await verifyGraphSubmission({ repositoryRoot, appRoot, exerciseRoot: path.resolve(appRoot, "..") });
if (failures.length) {
  console.error(`Code graph verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("Verified graph regeneration, Mermaid syntax and semantics, source-line traceability, stale-claim decisions, source SHA, and evidence hashes.");
