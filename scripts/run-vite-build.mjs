import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "exercise-vite-build-"));

function run(modulePath, args) {
  const result = spawnSync(process.execPath, [modulePath, ...args], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

try {
  if (!process.argv.includes("--skip-typecheck")) {
    run(path.join(projectRoot, "node_modules", "typescript", "bin", "tsc"), ["--noEmit", "--pretty", "false", "--incremental", "false"]);
  }
  run(path.join(projectRoot, "node_modules", "vite", "bin", "vite.js"), [
    "build",
    "--outDir",
    path.join(temporary, "dist"),
    "--emptyOutDir",
  ]);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
