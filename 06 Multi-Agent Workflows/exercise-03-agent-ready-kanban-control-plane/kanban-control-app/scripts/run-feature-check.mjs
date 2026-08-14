import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const appRoot = process.cwd();
const reviewedSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
console.log(`Reviewed SHA: ${reviewedSha}`);
console.log("Card: ESC-120");
const vitestCli = path.join(appRoot, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [vitestCli, "run", "acceptance/esc-120.inherited-severity.test.tsx", "tests/esc-120"], {
  cwd: appRoot,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
