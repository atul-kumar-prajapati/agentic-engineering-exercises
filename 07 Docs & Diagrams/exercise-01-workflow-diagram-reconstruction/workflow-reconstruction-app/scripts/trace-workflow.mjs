import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const source = fs.readFileSync(path.join(root, "src", "workflow.tsx"), "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { nextStepFor } = await import(moduleUrl);

function trace(seed) {
  const states = [seed.status];
  const actors = [];
  let request = { ...seed };
  for (let index = 0; index < 12; index += 1) {
    const step = nextStepFor(request);
    if (step.status === request.status) break;
    states.push(step.status);
    actors.push(step.event.actor);
    request = { ...request, status: step.status };
  }
  return { states, actors };
}

const normal = trace({ status: "draft", risk: "normal", provisioningHealthy: true });
const highRisk = trace({ status: "draft", risk: "high", provisioningHealthy: true });
const failure = trace({ status: "manager-approved", risk: "normal", provisioningHealthy: false });

const expected = {
  normal: ["draft", "submitted", "manager-approved", "data-owner-review", "provisioning", "provisioned"],
  highRisk: ["draft", "submitted", "manager-approved", "security-review", "data-owner-review", "provisioning", "provisioned"],
  failure: ["manager-approved", "data-owner-review", "provisioning", "failed-provisioning", "rollback-requested", "rolled-back"],
};
for (const [name, states] of Object.entries(expected)) {
  const actual = { normal, highRisk, failure }[name].states;
  if (JSON.stringify(actual) !== JSON.stringify(states)) throw new Error(`${name} scenario differs from the protected workflow contract`);
}

console.log(`Source SHA: ${sourceSha}`);
console.log(JSON.stringify({ normal, highRisk, failure }, null, 2));
console.log("PASS: normal approval, high-risk security review, provisioning failure, and rollback traces match the implementation.");
