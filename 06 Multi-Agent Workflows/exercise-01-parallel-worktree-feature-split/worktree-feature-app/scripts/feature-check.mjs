import { spawnSync } from "node:child_process";

const checks = [
  ["--experimental-strip-types", "--test", "src/utils/filters.test.mjs"],
  ["--experimental-strip-types", "--test", "src/utils/scoring.test.mjs"],
  ["src/services/workflowApi.evidence.test.mjs"],
];

for (const args of checks) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("feature-check passed for all three worktree lanes");
