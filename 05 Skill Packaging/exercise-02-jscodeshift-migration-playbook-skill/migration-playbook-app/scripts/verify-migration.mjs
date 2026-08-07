import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const transform = require("../transform/legacy-action.cjs");
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const input = await read("../fixtures/input/LegacyAction.tsx");
const expected = await read("../fixtures/expected/LegacyAction.tsx");
const stop = await read("../fixtures/stop/LegacyActionWithState.tsx");
const unchanged = await read("../fixtures/unchanged/ModernAction.tsx");
const api = { jscodeshift: require("jscodeshift"), j: require("jscodeshift") };
const run = (source, path) => transform({ source, path }, api, {}) ?? source;

const first = run(input, "LegacyAction.tsx");
assert.equal(first.trim(), expected.trim(), "transform output must match the expected fixture");
assert.equal(run(first, "LegacyAction.tsx").trim(), first.trim(), "transform must be idempotent");
assert.equal(run(stop, "LegacyActionWithState.tsx"), stop, "stateful stop fixture must not change");
assert.equal(run(unchanged, "ModernAction.tsx"), unchanged, "unrelated modern component must not change");
console.log("Migration output, idempotence, stop condition, and isolation verified.");
