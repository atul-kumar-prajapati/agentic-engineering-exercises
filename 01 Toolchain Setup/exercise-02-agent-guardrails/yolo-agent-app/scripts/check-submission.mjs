import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { evaluateAction, policyWeaknesses } from "./policy-engine.mjs";

const root = path.resolve(import.meta.dirname, "..");
const policyPath = path.join(root, ".agent", "guardrails.json");
const policy = JSON.parse(await readFile(policyPath, "utf8"));
const weaknesses = policyWeaknesses(policy);
if (weaknesses.length) throw new Error(`Guardrail policy is incomplete:\n- ${weaknesses.join("\n- ")}`);
const blockedProbe = evaluateAction(policy, { operation: "read", path: "secrets/production.env" });
await appendFile(path.join(root, ".agent", "audit.log"), `${JSON.stringify({ action: "read secrets/production.env", ...blockedProbe })}\n`);
if (blockedProbe.decision !== "blocked") throw new Error("Secret read probe was not blocked");
console.log("Submitted guardrail policy passed executable checks and produced an audit record.");
