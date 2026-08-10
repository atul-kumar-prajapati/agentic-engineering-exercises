import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundle = path.resolve(appRoot, "..", "fixtures", "release-history.bundle");
if (!existsSync(bundle)) throw new Error(`Missing ${bundle}`);
const heads = execFileSync("git", ["bundle", "list-heads", bundle], { encoding: "utf8" });
for (const ref of ["refs/tags/exercise-base", "refs/heads/exercise-head"]) {
  if (!heads.includes(ref)) throw new Error(`Bundle is missing ${ref}`);
}
console.log("Release fixture contains independently inspectable base and head refs.");
