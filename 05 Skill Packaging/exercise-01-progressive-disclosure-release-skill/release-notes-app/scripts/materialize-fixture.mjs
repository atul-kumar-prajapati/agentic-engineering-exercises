import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const targetArgument = process.argv[2];
if (!targetArgument) {
  throw new Error("Usage: npm run fixture:materialize -- <target-directory>");
}

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundle = path.resolve(appRoot, "..", "fixtures", "release-history.bundle");
const target = path.resolve(targetArgument);

if (!existsSync(bundle)) throw new Error(`Release fixture is missing: ${bundle}`);
if (existsSync(target)) throw new Error(`Target already exists; choose a new directory: ${target}`);

execFileSync("git", ["clone", bundle, target], { stdio: "inherit" });
console.log(`Materialized release fixture at ${target}`);
console.log("Available ranges: exercise-base..origin/exercise-head, exercise-base..hotfix-head, breaking-head..origin/exercise-head");
