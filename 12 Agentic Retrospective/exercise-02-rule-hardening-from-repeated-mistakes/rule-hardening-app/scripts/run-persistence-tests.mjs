import assert from "node:assert/strict";
import { buildSavedFilter } from "../src/services/filterPersistence.mjs";

const now = "2026-08-12T09:00:00.000Z";
let clockCalls = 0;
const input = { owner: { id: "user-42", label: "Asha Nair" }, statusLabel: "  Blocked " };
const original = structuredClone(input);
const saved = buildSavedFilter(input, () => { clockCalls += 1; return now; });
assert.deepEqual(saved, { ownerId: "user-42", status: "blocked", updatedAt: now });
assert.deepEqual(input, original, "builder must not mutate its input");
assert.equal(clockCalls, 1, "caller-provided clock must be called exactly once");

const renamed = buildSavedFilter({ owner: { id: "user-42", label: "Asha Renamed" }, statusLabel: "READY" }, () => now);
assert.deepEqual(renamed, { ownerId: "user-42", status: "ready", updatedAt: now }, "labels must not become durable identity");
console.log("PASS stable identity, canonical values, injected time, exact shape, and immutability");
