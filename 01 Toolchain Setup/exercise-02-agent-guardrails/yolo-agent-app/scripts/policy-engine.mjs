import path from "node:path";

const normalize = (value = "") => value.replaceAll("\\", "/").replace(/^\.\//, "");
const matches = (value, pattern) => {
  const escaped = normalize(pattern).replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("**", "::ALL::").replaceAll("*", "[^/]*").replaceAll("::ALL::", ".*");
  return new RegExp(`^${escaped}$`, "i").test(normalize(value));
};

export function evaluateAction(policy, action) {
  const target = normalize(action.path);
  if (target.includes("../") || path.posix.isAbsolute(target) || path.win32.isAbsolute(action.path ?? "") || action.symlinkTarget) return { decision: "blocked", reason: "path escape or symlink" };
  if (/ignore (all|previous) (rules|instructions)|reveal.*secret/i.test(action.prompt ?? "")) return { decision: "blocked", reason: "prompt injection" };
  if (policy.blockedPaths.some((pattern) => matches(target, pattern))) return { decision: "blocked", reason: "blocked path" };
  if (policy.blockedCommands.some((pattern) => new RegExp(pattern, "i").test(action.command ?? ""))) return { decision: "blocked", reason: "blocked command" };
  if (policy.approvalPaths.some((pattern) => matches(target, pattern))) return { decision: "approval-required", reason: "approval path" };
  if (policy.approvalCommands.some((pattern) => new RegExp(pattern, "i").test(action.command ?? ""))) return { decision: "approval-required", reason: "approval command" };
  if (!policy.allowedOperations.includes(action.operation)) return { decision: "blocked", reason: "operation is not allowed" };
  return { decision: "allowed", reason: "explicitly allowed" };
}

export function policyWeaknesses(policy) {
  const failures = [];
  const requiredBlocked = ["secrets/**", ".env", "**/*.env", "config/production.json"];
  for (const pattern of requiredBlocked) if (!policy.blockedPaths.includes(pattern)) failures.push(`missing blocked path ${pattern}`);
  if (!policy.blockedCommands.some((pattern) => /deploy|release/.test(pattern))) failures.push("missing deploy/release command guard");
  if (!policy.approvalCommands.some((pattern) => /migration|migrate/.test(pattern))) failures.push("missing migration approval guard");
  return failures;
}
