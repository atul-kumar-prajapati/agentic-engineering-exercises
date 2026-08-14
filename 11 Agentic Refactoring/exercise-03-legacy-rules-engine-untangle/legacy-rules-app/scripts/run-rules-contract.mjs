import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const exerciseRoot = path.resolve(process.cwd(), "..");
const apiRoot = path.join(exerciseRoot, "legacy-rules-api");
if (process.platform === "win32") {
  execFileSync("cmd.exe", ["/d", "/s", "/c", "mvnw.cmd", "test", "--no-transfer-progress"], { cwd: apiRoot, stdio: "inherit" });
} else {
  execFileSync("./mvnw", ["test", "--no-transfer-progress"], { cwd: apiRoot, stdio: "inherit" });
}

const service = fs.readFileSync(path.join(apiRoot, "src/main/java/dev/agentic/exercise/workflow/WorkflowService.java"), "utf8");
const policyPath = path.join(apiRoot, "src/main/java/dev/agentic/exercise/workflow/DecisionPolicy.java");
if (!fs.existsSync(policyPath)) throw new Error("Create DecisionPolicy.java");
const policy = fs.readFileSync(policyPath, "utf8");
if (service.includes('"Ready".equals') || service.includes("Ready decisions require a longer evidence note")) throw new Error("Decision validation remains in WorkflowService");
if (!policy.includes('"Ready".equals') || !policy.includes("Ready decisions require a longer evidence note")) throw new Error("DecisionPolicy does not own the protected Ready rule");
if (/WorkflowRepository|\.save\(|\.findById\(/.test(policy)) throw new Error("DecisionPolicy must not access persistence");
execFileSync(process.execPath, ["./scripts/run-client-contract.mjs"], { cwd: process.cwd(), stdio: "inherit" });
console.log("PASS backend architecture, behavior, HTTP JSON, and client contract");
