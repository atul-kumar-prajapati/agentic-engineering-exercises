import { spawnSync } from "node:child_process";
import path from "node:path";

const vitest = path.join(process.cwd(), "node_modules", "vitest", "vitest.mjs");
const seeds = [104, 108, 220];

for (const seed of seeds) {
  console.log(`Network stability seed: ${seed}`);
  const result = spawnSync(
    process.execPath,
    [vitest, "run", "--pool=forks", "--maxWorkers=1", "--sequence.shuffle", `--sequence.seed=${seed}`],
    { cwd: process.cwd(), stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Network stability passed for seeds: ${seeds.join(", ")}`);
