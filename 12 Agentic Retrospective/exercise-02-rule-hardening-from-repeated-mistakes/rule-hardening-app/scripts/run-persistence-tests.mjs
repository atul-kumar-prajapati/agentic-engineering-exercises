import assert from "node:assert/strict";
import { buildSavedFilter } from "../src/services/filterPersistence.mjs";
const now = "2026-08-12T09:00:00.000Z";
const saved = buildSavedFilter({ owner: { id: "user-42", label: "Asha Nair" }, statusLabel: "Blocked" }, () => now);
assert.deepEqual(saved, { ownerId: "user-42", status: "blocked", updatedAt: now });
console.log("Saved filter uses stable identity, canonical status, and injected time.");
