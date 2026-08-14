import assert from "node:assert/strict";
import { validateSnapshots } from "./rules-refactor-verification.mjs";

const observation = [{ case: "boundary", outcome: "accepted" }];
assert.deepEqual(validateSnapshots(observation, structuredClone(observation), structuredClone(observation)), []);
assert.ok(validateSnapshots(observation, [{ case: "boundary", outcome: "rejected" }], observation).length > 0);
console.log("rules extraction verifier self-test passed");
