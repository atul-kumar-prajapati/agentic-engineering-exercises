import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "workflow-gate-app");
const provider = path.join(root, "workflow-rules-api");
const commands = [
  { label: "client release tests", command: "npm", args: ["run", "test:release"], cwd: client },
  { label: "client quality and build", command: "npm", args: ["run", "agent:check"], cwd: client },
  { label: "provider tests and build", command: process.platform === "win32" ? "mvnw.cmd" : "./mvnw", args: ["test"], cwd: provider },
];

for (const step of commands) {
  console.log(`\nVERIFY ${step.label}: ${step.command} ${step.args.join(" ")}`);
  const result = spawnSync(step.command, step.args, { cwd: step.cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`FAILED ${step.label} with exit code ${result.status ?? 1}`);
    process.exit(result.status ?? 1);
  }
  console.log(`PASS ${step.label}`);
}
console.log("\nVERIFIED release gate passed with fresh client and provider evidence.");
