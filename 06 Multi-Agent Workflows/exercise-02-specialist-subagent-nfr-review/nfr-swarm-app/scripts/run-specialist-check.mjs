import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const role = process.argv[2];
const tests = {
  security: "acceptance/security.review.test.tsx",
  accessibility: "acceptance/accessibility.review.test.tsx",
  performance: "acceptance/performance.review.test.ts",
  testability: "acceptance/testability.review.test.ts",
};
if (!tests[role]) throw new Error(`Unknown specialist role: ${role ?? "missing"}`);

const appRoot = process.cwd();
const reviewedSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
console.log(`Reviewed SHA: ${reviewedSha}`);
console.log(`Specialist: ${role}`);
const vitestCli = path.join(appRoot, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [vitestCli, "run", tests[role]], { cwd: appRoot, stdio: "inherit" });
process.exit(result.status ?? 1);
