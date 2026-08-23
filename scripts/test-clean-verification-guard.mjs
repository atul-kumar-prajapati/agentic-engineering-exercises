import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const guard = path.resolve("scripts/run-clean-verification.mjs");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "verification-state-guard-"));

function run(cwd, command, args) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

try {
  execFileSync("git", ["init"], { cwd: temporary });
  execFileSync("git", ["config", "user.name", "Verification Guard"], { cwd: temporary });
  execFileSync("git", ["config", "user.email", "guard@example.test"], { cwd: temporary });
  fs.writeFileSync(path.join(temporary, "tracked.txt"), "original\n");
  fs.writeFileSync(path.join(temporary, "package.json"), `${JSON.stringify({
    private: true,
    scripts: { "verify:exercise:core": "node verify-core.mjs" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(temporary, "verify-core.mjs"), "console.log('PASS stable verification');\n");
  execFileSync("git", ["add", "."], { cwd: temporary });
  execFileSync("git", ["commit", "-m", "fixture"], { cwd: temporary });
  fs.writeFileSync(path.join(temporary, "untracked-notes.txt"), "keep this evidence unchanged\n");
  fs.writeFileSync(path.join(temporary, ".gitignore"), "ignored-output.txt\n");
  execFileSync("git", ["add", ".gitignore"], { cwd: temporary });
  execFileSync("git", ["commit", "-m", "ignore generated output"], { cwd: temporary });
  fs.writeFileSync(path.join(temporary, "ignored-output.txt"), "stable generated state\n");

  const stable = run(temporary, process.execPath, [guard]);
  assert.equal(stable.status, 0, stable.stderr);
  assert.match(stable.stdout, /left tracked files, the Git index, and untracked or ignored paths unchanged/);

  fs.writeFileSync(path.join(temporary, "verify-core.mjs"), "import fs from 'node:fs'; fs.writeFileSync('tracked.txt', 'changed\\n');\n");
  execFileSync("git", ["add", "verify-core.mjs"], { cwd: temporary });
  execFileSync("git", ["commit", "-m", "mutating verifier"], { cwd: temporary });
  const mutating = run(temporary, process.execPath, [guard]);
  assert.equal(mutating.status, 1);
  assert.match(mutating.stderr, /Verification changed repository state/);
  assert.match(mutating.stderr, /tracked\.txt/);

  fs.writeFileSync(path.join(temporary, "tracked.txt"), "original\n");
  fs.writeFileSync(path.join(temporary, "verify-core.mjs"), "import fs from 'node:fs'; fs.writeFileSync('untracked-notes.txt', 'changed evidence\\n');\n");
  execFileSync("git", ["add", "tracked.txt", "verify-core.mjs"], { cwd: temporary });
  execFileSync("git", ["commit", "-m", "untracked mutating verifier"], { cwd: temporary });
  const untrackedMutating = run(temporary, process.execPath, [guard]);
  assert.equal(untrackedMutating.status, 1);
  assert.match(untrackedMutating.stderr, /untracked-notes\.txt \(untracked file changed\)/);

  fs.writeFileSync(path.join(temporary, "untracked-notes.txt"), "keep this evidence unchanged\n");
  fs.writeFileSync(path.join(temporary, "verify-core.mjs"), "import fs from 'node:fs'; fs.writeFileSync('ignored-output.txt', 'changed ignored output\\n');\n");
  execFileSync("git", ["add", "verify-core.mjs"], { cwd: temporary });
  execFileSync("git", ["commit", "-m", "ignored mutating verifier"], { cwd: temporary });
  const ignoredMutating = run(temporary, process.execPath, [guard]);
  assert.equal(ignoredMutating.status, 1);
  assert.match(ignoredMutating.stderr, /ignored-output\.txt \(ignored file changed\)/);
  console.log("clean verification guard self-test passed");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
