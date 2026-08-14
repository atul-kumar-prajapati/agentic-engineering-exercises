import assert from "node:assert/strict";
import { parseNumstat } from "./scope-verification.mjs";

const stats = parseNumstat("3\t2\tpath/a.mjs\n10\t0\tpath/b.test.mjs\n");
assert.deepEqual(stats, { rows: [{ file: "path/a.mjs", additions: 3, deletions: 2 }, { file: "path/b.test.mjs", additions: 10, deletions: 0 }], files: 2, additions: 13, deletions: 2, changedLines: 15 });
assert.throws(() => parseNumstat("-\t-\tbinary.bin"), /non-text/);
console.log("scope verifier self-test passed");
