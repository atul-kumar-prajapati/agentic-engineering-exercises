import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exerciseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const provider = path.join(exerciseRoot, "workflow-rules-api");
const command = process.platform === "win32" ? "mvnw.cmd" : "./mvnw";
const args = ["-q", "-Dtest=WorkflowServiceTest", "test"];

console.log(`PREVIOUS CHECK: ${command} ${args.join(" ")}`);
const result = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/d", "/s", "/c", [command, ...args].join(" ")], {
      cwd: provider,
      stdio: "inherit",
      shell: false,
    })
  : spawnSync(command, args, { cwd: provider, stdio: "inherit", shell: false });

if (result.error) {
  console.error(`PREVIOUS CHECK SPAWN ERROR: ${result.error.message}`);
  process.exitCode = 1;
} else {
  console.log(`PREVIOUS CHECK EXIT CODE: ${result.status ?? 1}`);
  process.exitCode = result.status ?? 1;
}
