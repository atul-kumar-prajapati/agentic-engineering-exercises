import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyComparableEvidence } from "./comparable-evidence.mjs";

function git(root, args, options = {}) {
  return execFileSync("git", args, { cwd: root, encoding: options.encoding ?? "utf8" }).trim();
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "comparable-evidence-test-"));
try {
  const exerciseRoot = path.join(temporary, "exercise");
  git(temporary, ["init"]);
  git(temporary, ["config", "user.name", "Verifier"]);
  git(temporary, ["config", "user.email", "verifier@example.test"]);
  write(path.join(exerciseRoot, "app.txt"), "start\n");
  git(temporary, ["add", "."]);
  git(temporary, ["commit", "-m", "start"]);
  const start = git(temporary, ["rev-parse", "HEAD"]);

  write(path.join(exerciseRoot, "app.txt"), "before attempt\n");
  const beforePatch = execFileSync("git", ["diff", "--binary", "--full-index"], { cwd: temporary });
  git(temporary, ["add", "."]);
  git(temporary, ["commit", "-m", "before implementation"]);
  const beforeImplementation = git(temporary, ["rev-parse", "HEAD"]);

  git(temporary, ["checkout", "--detach", start]);
  write(path.join(exerciseRoot, "app.txt"), "after\n");
  const afterPatch = execFileSync("git", ["diff", "--binary", "--full-index"], { cwd: temporary });
  git(temporary, ["add", "."]);
  git(temporary, ["commit", "-m", "after implementation"]);
  const afterImplementation = git(temporary, ["rev-parse", "HEAD"]);

  const evidence = path.join(exerciseRoot, "evidence");
  write(path.join(evidence, "before.patch"), beforePatch);
  write(path.join(evidence, "after.patch"), afterPatch);
  const common = `Starting commit: ${start}\nAgent and model: Example Agent\nTools and permissions: local read and write\nTime limit: 30 minutes\nHuman hints: 0\nRetries: 0\n`;
  write(path.join(evidence, "before.md"), `${common}Implementation commit: ${beforeImplementation}\nPatch SHA-256: ${hash(path.join(evidence, "before.patch"))}\n`);
  write(path.join(evidence, "after.md"), `${common}Implementation commit: ${afterImplementation}\nPatch SHA-256: ${hash(path.join(evidence, "after.patch"))}\n`);
  write(path.join(evidence, "comparison.md"), "# Comparison\nSame conditions were used. Before proof failed; after proof passed. Conclusion: the change improved the result.\n");
  git(temporary, ["add", "."]);
  git(temporary, ["commit", "-m", "evidence"]);

  assert.deepEqual(verifyComparableEvidence({ repositoryRoot: temporary, exerciseRoot }), []);
  write(path.join(evidence, "before.patch"), afterPatch);
  assert.ok(verifyComparableEvidence({ repositoryRoot: temporary, exerciseRoot }).some((failure) => failure.includes("before.patch must exactly match")));
  write(path.join(evidence, "before.patch"), beforePatch);
  fs.appendFileSync(path.join(evidence, "after.patch"), "tamper\n");
  assert.ok(verifyComparableEvidence({ repositoryRoot: temporary, exerciseRoot }).some((failure) => failure.includes("SHA-256")));
  console.log("Comparable evidence verifier self-test passed");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
