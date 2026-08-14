import assert from "node:assert/strict";
import fs from "node:fs";
import { measureContext } from "./measure-context.mjs";

const input = "../docs/monolithic-skill-draft.md";
const measured = measureContext([input]);
assert.equal(measured.files.length, 1);
assert.equal(measured.files[0].bytes, Buffer.byteLength(fs.readFileSync(input, "utf8"), "utf8"));
assert.equal(measured.total_context_bytes, measured.files[0].bytes);
assert.throws(() => measureContext(["../../../README.md"]), /outside this exercise/);
console.log("context measurement self-test passed");
