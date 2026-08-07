import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(path.join(root, "fixtures", "manifest.json"), "utf8"));
const bundle = path.join(root, "fixtures", manifest.bundle);
const heads = execFileSync("git", ["bundle", "list-heads", bundle], { encoding: "utf8" });
if (!heads.includes(manifest.baseSha) || !heads.includes(manifest.headSha)) throw new Error("Bundle refs do not match manifest SHAs");
const patch = readFileSync(path.join(root, "pr", "review-target.diff"), "utf8");
if (!patch.includes("localStorage") || !patch.includes("clearCachedWorkflowItems")) throw new Error("Review patch is incomplete");
const temp = mkdtempSync(path.join(tmpdir(), "fresh-review-fixture-"));
try {
  execFileSync("git", ["init", "-q", temp]);
  execFileSync("git", ["-C", temp, "fetch", "-q", bundle, `refs/tags/${manifest.baseRef}:refs/tags/${manifest.baseRef}`, `refs/heads/${manifest.headRef}:refs/heads/${manifest.headRef}`]);
  const generated = execFileSync("git", ["-C", temp, "diff", manifest.baseSha, manifest.headSha], { encoding: "utf8" });
  const normalize = (value) => value.replaceAll("\r\n", "\n").trimEnd();
  if (normalize(generated) !== normalize(patch)) throw new Error("Review patch does not match the bundled comparison");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log(`Fresh-review fixture verified: ${manifest.comparison}`);
