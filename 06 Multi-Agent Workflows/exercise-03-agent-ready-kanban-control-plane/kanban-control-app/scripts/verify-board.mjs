import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyBoardState } from "./board-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const reviewedSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
console.log(`Reviewed SHA: ${reviewedSha}`);
const failures = verifyBoardState({ exerciseRoot, appRoot });
if (failures.length) {
  console.error(`Board verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("PASS: board mirrors, card histories, blockers, reservation releases, ownership, and integration records are consistent.");
