import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "extract-release.mjs");

function git(repository, ...args) {
  return execFileSync("git", ["-C", repository, ...args], { encoding: "utf8" }).trim();
}

test("extracts the requested Git range without classifying fixture answers", () => {
  const repository = mkdtempSync(path.join(os.tmpdir(), "release-skill-test-"));
  try {
    git(repository, "init");
    git(repository, "config", "user.name", "Release Skill Test");
    git(repository, "config", "user.email", "release-skill@example.test");

    writeFileSync(path.join(repository, "api.js"), "export const field = 'old';\n");
    git(repository, "add", "api.js");
    git(repository, "commit", "-m", "baseline");
    git(repository, "tag", "base");

    writeFileSync(path.join(repository, "api.js"), "export const field = 'new';\n");
    git(repository, "add", "api.js");
    git(repository, "commit", "-m", "BREAKING rename public field");

    writeFileSync(path.join(repository, "internal.js"), "export const metric = 'v2';\n");
    git(repository, "add", "internal.js");
    git(repository, "commit", "-m", "chore: rename internal metric");

    const output = execFileSync(
      process.execPath,
      [script, "--repo", repository, "--range", "base..HEAD"],
      { encoding: "utf8" },
    );
    const extracted = JSON.parse(output);

    assert.equal(extracted.range, "base..HEAD");
    assert.equal(extracted.revisionCount, 2);
    assert.deepEqual(extracted.changedPaths, ["api.js", "internal.js"]);
    assert.equal(extracted.commits[0].breakingSignal, true);
    assert.equal(extracted.commits[1].breakingSignal, false);
    assert.match(extracted.patch, /field = 'new'/);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});
