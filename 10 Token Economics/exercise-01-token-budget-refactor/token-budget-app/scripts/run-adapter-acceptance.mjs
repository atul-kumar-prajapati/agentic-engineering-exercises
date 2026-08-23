import assert from "node:assert/strict";
import { adaptSession, SessionAdapterError } from "../src/session/adaptSession.mjs";

function expectedError(input, code, message) {
  assert.throws(() => adaptSession(input), (error) => error instanceof SessionAdapterError && error.name === "SessionAdapterError" && error.code === code && error.message === message);
}

const input = { userId: "user-17", roles: ["agent", "reviewer", "agent"], expiresAt: "2026-08-14T10:30:00.000Z", ignored: "value" };
assert.deepEqual(adaptSession(input), { userId: "user-17", roles: ["agent", "reviewer"], expiresAt: "2026-08-14T10:30:00.000Z" });
assert.deepEqual(adaptSession({ userId: "user-18", roles: [], expiresAt: "2026-08-14T10:30:00Z" }), { userId: "user-18", roles: [], expiresAt: "2026-08-14T10:30:00Z" });
expectedError({ roles: [null], expiresAt: "bad" }, "SESSION_USER_REQUIRED", "Session userId is required");
expectedError({ userId: "user-19", roles: "admin", expiresAt: "bad" }, "SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
expectedError({ userId: "user-19", roles: "admin", expiresAt: "2026-08-14T10:30:00Z" }, "SESSION_ROLES_INVALID", "Session roles must be an array of non-empty strings");
expectedError({ userId: "user-19", roles: [""], expiresAt: "2026-08-14T10:30:00Z" }, "SESSION_ROLES_INVALID", "Session roles must be an array of non-empty strings");
expectedError({ userId: "user-19", roles: [], expiresAt: "tomorrow" }, "SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
expectedError({ userId: "user-19", roles: [], expiresAt: "2026-02-30T10:30:00Z" }, "SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
const result = adaptSession(input);
assert.equal(result instanceof Promise, false, "adapter must remain synchronous");
assert.equal(JSON.stringify(result), '{"userId":"user-17","roles":["agent","reviewer"],"expiresAt":"2026-08-14T10:30:00.000Z"}');
console.log("PASS protected session adapter contract");
