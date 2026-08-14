import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyLaneSubmission } from "./worktree-verification.mjs";

const appRoot = process.cwd();
const repositoryRoot = path.resolve(execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim());
const failures = verifyLaneSubmission({ repositoryRoot, appRoot, exerciseRoot: path.resolve(appRoot, "..") });
if (failures.length) {
  console.error("Parallel worktree verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Verified three isolated lane commits, ordered no-ff merges, one shared-type resolution, worktree evidence, and command outputs.");
