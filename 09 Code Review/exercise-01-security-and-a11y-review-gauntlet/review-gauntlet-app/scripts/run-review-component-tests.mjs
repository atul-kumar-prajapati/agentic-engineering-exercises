import assert from "node:assert/strict";
import fs from "node:fs";

const action = fs.readFileSync("src/components/ActionComposer.tsx", "utf8");
const queue = fs.readFileSync("src/components/WorkQueue.tsx", "utf8");
const announcement = fs.readFileSync("src/components/SafeAnnouncement.tsx", "utf8");
const failures = [];

try { assert.ok(!action.includes("dangerouslySetInnerHTML"), "reviewer notes must not enter an HTML sink"); }
catch (error) { failures.push(error.message); }
try { assert.match(action, /disabled=\{saving\s*\|\|\s*note\.trim\(\)\.length\s*<\s*8\}/, "client must preserve short-note validation"); }
catch (error) { failures.push(error.message); }
try { assert.match(action, /<button[^>]*type="button"/, "save action must declare button type"); }
catch (error) { failures.push(error.message); }
try {
  assert.ok(
    /return\s*<button\b/.test(queue)
      && /type="button"/.test(queue)
      && /onClick=/.test(queue),
    "queue items must be native keyboard-operable buttons",
  );
}
catch (error) { failures.push(error.message); }
try { assert.match(announcement, /dangerouslySetInnerHTML/, "the deliberate safe scanner finding must remain for classification"); }
catch (error) { failures.push(error.message); }

if (failures.length) {
  console.error(`Review component checks failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("PASS notes render without an untrusted HTML sink");
console.log("PASS client note validation and explicit button type restored");
console.log("PASS queue rows use native keyboard-operable buttons");
console.log("PASS deliberate source-controlled scanner finding retained");
