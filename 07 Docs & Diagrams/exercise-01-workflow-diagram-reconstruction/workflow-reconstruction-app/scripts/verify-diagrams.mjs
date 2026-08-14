import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyDiagramSubmission } from "./diagram-verification.mjs";

const appRoot = process.cwd();
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = await verifyDiagramSubmission({ repositoryRoot, appRoot, exerciseRoot: path.resolve(appRoot, "..") });
if (failures.length) {
  console.error(`Workflow diagram verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("Verified Mermaid syntax, implemented transitions, actor sequences, source-line traceability, contradictions, Git source binding, and evidence hashes.");
