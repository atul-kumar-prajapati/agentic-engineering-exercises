import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const input = await readFile(new URL("../fixtures/input/LegacyAction.tsx", import.meta.url), "utf8");
const expected = await readFile(new URL("../fixtures/expected/LegacyAction.tsx", import.meta.url), "utf8");
const stop = await readFile(new URL("../fixtures/stop/LegacyActionWithState.tsx", import.meta.url), "utf8");
assert.match(input, /extends Component/);
assert.match(expected, /export function LegacyAction/);
assert.match(stop, /state =/);
assert.notEqual(input, expected);
console.log("Migration starter contains input, expected, stop, and unchanged fixtures.");
