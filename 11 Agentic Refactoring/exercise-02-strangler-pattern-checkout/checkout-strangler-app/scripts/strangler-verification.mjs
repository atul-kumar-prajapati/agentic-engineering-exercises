import path from "node:path";
import { execFileSync } from "node:child_process";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function verifyStranglerHistory({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const expected = [
      `${prefix}/checkout-strangler-app/src/checkout/cardCheckout.mjs`,
      `${prefix}/checkout-strangler-app/src/checkout/checkoutRouter.mjs`,
      `${prefix}/checkout-strangler-app/src/checkout/checkoutRouter.test.mjs`,
    ].sort();
    const actual = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push("sourceSha must contain only the card slice, router, and participant test");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be a full ancestor commit in this repository"); }
  return failures;
}

export function validateRouteMatrix(text) {
  const failures = [];
  for (const term of ["card", "gift-card", "invoice", "unknown", "flag off", "pre-authorization", "ambiguous", "legacy", "new slice"]) {
    if (!text.toLowerCase().includes(term)) failures.push(`route matrix is missing ${term}`);
  }
  return failures;
}
