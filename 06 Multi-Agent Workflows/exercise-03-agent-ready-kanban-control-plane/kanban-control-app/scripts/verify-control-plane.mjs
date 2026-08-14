import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyControlPlaneSubmission } from "./control-plane-verification.mjs";

const appRoot = process.cwd();
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = verifyControlPlaneSubmission({ repositoryRoot, appRoot, exerciseRoot: path.resolve(appRoot, "..") });
if (failures.length) {
  console.error(`Kanban control-plane verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("Verified safe card states, one owned lane commit, exact review, no-ff integration, synchronized control artifacts, and hashed evidence.");
