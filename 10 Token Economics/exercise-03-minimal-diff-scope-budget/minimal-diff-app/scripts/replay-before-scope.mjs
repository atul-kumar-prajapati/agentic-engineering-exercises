import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { parseNumstat } from "./scope-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const prefix = path.relative(repositoryRoot, exerciseRoot);
const beforeMarkdown = fs.readFileSync(path.join(exerciseRoot, "evidence", "before.md"), "utf8");
const starting = beforeMarkdown.match(/^\s*(?:[-*]\s*)?Starting commit:\s*`?([^`\r\n]+)/mi)?.[1].trim() ?? "";
const patch = path.join(exerciseRoot, "evidence", "before.patch");
const recorded = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "evidence", "before-scope.json"), "utf8"));
const numstat = execFileSync("git", ["apply", "--numstat", patch], { cwd: repositoryRoot, encoding: "utf8" });
const actual = parseNumstat(numstat);
for (const field of ["files", "additions", "deletions", "changedLines"]) if (recorded[field] !== actual[field]) throw new Error(`before-scope.json ${field} does not match before.patch`);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "minimal-diff-before-"));
try {
  execFileSync("git", ["worktree", "add", "--detach", temporary, starting], { cwd: repositoryRoot, stdio: "ignore" });
  execFileSync("git", ["apply", "--whitespace=nowarn", patch], { cwd: temporary });
  const result = spawnSync(process.execPath, [path.join(temporary, prefix, "minimal-diff-app", "scripts", "run-migration-tests.mjs")], { cwd: path.join(temporary, prefix, "minimal-diff-app"), encoding: "utf8" });
  if (result.status !== 0) throw new Error(`before.patch does not satisfy protected behavior:\n${result.stderr || result.stdout}`);
  console.log(`PASS before.patch reproduces ${actual.files} files and ${actual.changedLines} changed lines`);
  console.log("PASS before.patch satisfies the protected migration behavior");
} finally {
  try { execFileSync("git", ["worktree", "remove", "--force", temporary], { cwd: repositoryRoot, stdio: "ignore" }); }
  catch { fs.rmSync(temporary, { recursive: true, force: true }); }
}
