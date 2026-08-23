import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const prefix = path.relative(repositoryRoot, exerciseRoot);
function field(file, name) {
  const source = fs.readFileSync(file, "utf8");
  return source.match(new RegExp("^\\s*(?:[-*]\\s*)?" + name + ":\\s*`?([^`\\r\\n]+)", "mi"))?.[1].trim() ?? "";
}
for (const lane of ["before", "after"]) {
  const markdown = path.join(exerciseRoot, "evidence", `${lane}.md`);
  const starting = field(markdown, "Starting commit");
  const patch = path.join(exerciseRoot, "evidence", `${lane}.patch`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), `context-${lane}-`));
  try {
    execFileSync("git", ["worktree", "add", "--detach", temporary, starting], { cwd: repositoryRoot, stdio: "ignore" });
    execFileSync("git", ["apply", "--whitespace=nowarn", patch], { cwd: temporary });
    const result = spawnSync(process.execPath, [path.join(temporary, prefix, "token-budget-app", "scripts", "run-adapter-acceptance.mjs")], { cwd: path.join(temporary, prefix, "token-budget-app"), encoding: "utf8" });
    if (result.status !== 0) throw new Error(`${lane} patch does not preserve the adapter contract:\n${result.stderr || result.stdout}`);
    console.log(`PASS ${lane} patch preserves the protected adapter contract`);
  } finally {
    try { execFileSync("git", ["worktree", "remove", "--force", temporary], { cwd: repositoryRoot, stdio: "ignore" }); }
    catch { fs.rmSync(temporary, { recursive: true, force: true }); }
  }
}
