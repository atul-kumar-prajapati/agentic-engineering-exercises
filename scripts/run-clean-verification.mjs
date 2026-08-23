import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

function nulList(source) {
  return source.split("\0").filter(Boolean);
}

function fileDigest(repositoryRoot, relative) {
  const absolute = path.join(repositoryRoot, relative);
  if (!fs.existsSync(absolute)) return "missing";
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink()) return `symlink:${fs.readlinkSync(absolute)}`;
  if (!stat.isFile()) return `non-file:${stat.mode}`;
  return crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
}

function snapshot(repositoryRoot) {
  const tracked = nulList(git(repositoryRoot, ["ls-files", "-z"]));
  const untracked = nulList(git(repositoryRoot, ["ls-files", "--others", "--exclude-standard", "-z"])).sort();
  const ignored = nulList(git(repositoryRoot, ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"]))
    .filter((relative) => !relative.split("/").includes("node_modules"))
    .sort();
  const trackedFiles = Object.fromEntries(tracked.map((relative) => [relative, fileDigest(repositoryRoot, relative)]));
  return {
    index: git(repositoryRoot, ["ls-files", "--stage", "-z"]),
    trackedFiles,
    untrackedFiles: Object.fromEntries(untracked.map((relative) => [relative, fileDigest(repositoryRoot, relative)])),
    ignoredFiles: Object.fromEntries(ignored.map((relative) => [relative, fileDigest(repositoryRoot, relative)])),
  };
}

function changedPaths(before, after) {
  const paths = new Set([...Object.keys(before.trackedFiles), ...Object.keys(after.trackedFiles)]);
  const changed = [...paths].filter((relative) => before.trackedFiles[relative] !== after.trackedFiles[relative]);
  if (before.index !== after.index) changed.push("<git index>");
  const beforeUntracked = new Set(Object.keys(before.untrackedFiles));
  const afterUntracked = new Set(Object.keys(after.untrackedFiles));
  for (const relative of beforeUntracked) {
    if (!afterUntracked.has(relative)) changed.push(`${relative} (untracked file removed)`);
    else if (before.untrackedFiles[relative] !== after.untrackedFiles[relative]) changed.push(`${relative} (untracked file changed)`);
  }
  for (const relative of afterUntracked) if (!beforeUntracked.has(relative)) changed.push(`${relative} (untracked file created)`);
  const ignoredPaths = new Set([...Object.keys(before.ignoredFiles), ...Object.keys(after.ignoredFiles)]);
  for (const relative of ignoredPaths) {
    if (before.ignoredFiles[relative] !== after.ignoredFiles[relative]) changed.push(`${relative} (ignored file changed)`);
  }
  return [...new Set(changed)].sort();
}

const projectRoot = process.cwd();
const repositoryRoot = git(projectRoot, ["rev-parse", "--show-toplevel"]).trim();
const before = snapshot(repositoryRoot);
const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const args = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm run verify:exercise:core"]
  : ["run", "verify:exercise:core"];
const result = spawnSync(command, args, {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});
const after = snapshot(repositoryRoot);
const mutations = changedPaths(before, after);

if (mutations.length) {
  console.error("Verification changed repository state:");
  for (const relative of mutations) console.error(`- ${relative}`);
  console.error("Restore the listed paths and make verification write generated checks to a temporary directory.");
  process.exit(1);
}

if (result.error) {
  console.error(`Unable to run verify:exercise:core: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) process.exit(result.status ?? 1);
console.log("PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged");
