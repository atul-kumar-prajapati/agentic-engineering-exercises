import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifySpecialistSubmission } from "./specialist-review-verification.mjs";

const appRoot = process.cwd();
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = verifySpecialistSubmission({ repositoryRoot, appRoot, exerciseRoot: path.resolve(appRoot, "..") });
if (failures.length) {
  console.error(`Specialist review verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("Verified four same-SHA specialist reviews, complete triage, remediation-only source changes, fresh rechecks, and comparable performance evidence.");
