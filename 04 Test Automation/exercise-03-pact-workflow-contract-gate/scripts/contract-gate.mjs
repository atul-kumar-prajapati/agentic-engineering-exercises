import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const consumer = path.join(root, "workflow-gate-app");
const provider = path.join(root, "workflow-rules-api");
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("npm", ["run", "test:consumer-contract"], consumer);
run(process.platform === "win32" ? "mvnw.cmd" : "./mvnw", ["test", "-Dtest=WorkflowPactVerificationTest"], provider);
