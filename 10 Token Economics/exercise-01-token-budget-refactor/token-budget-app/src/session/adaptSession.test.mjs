import assert from "node:assert/strict";
import test from "node:test";
import { adaptSession, SessionAdapterError } from "./adaptSession.mjs";

const VALID_EXPIRY = "2026-08-19T09:21:00.000Z";

function validInput(overrides = {}) {
  return {
    userId: "user-42",
    roles: ["reader", "editor"],
    expiresAt: VALID_EXPIRY,
    ...overrides,
  };
}

function assertAdapterError(error, code, message) {
  assert.equal(error.name, "SessionAdapterError");
  assert.ok(error instanceof SessionAdapterError);
  assert.equal(error.code, code);
  assert.equal(error.message, message);
}

test("returns userId, roles, and expiresAt while ignoring unknown fields", () => {
  const result = adaptSession(
    validInput({
      token: "should-not-leak",
      locale: "en-GB",
    }),
  );

  assert.deepEqual(result, {
    userId: "user-42",
    roles: ["reader", "editor"],
    expiresAt: VALID_EXPIRY,
  });
  assert.equal(Object.keys(result).join(","), "userId,roles,expiresAt");
});

test("missing userId is rejected before role normalization", () => {
  assert.throws(
    () =>
      adaptSession({
        roles: ["editor", "editor", "admin"],
        expiresAt: VALID_EXPIRY,
      }),
    (error) => {
      assertAdapterError(error, "SESSION_USER_REQUIRED", "Session userId is required");
      return true;
    },
  );
});

test("empty userId is rejected with the identity contract", () => {
  assert.throws(
    () => adaptSession(validInput({ userId: "" })),
    (error) => {
      assertAdapterError(error, "SESSION_USER_REQUIRED", "Session userId is required");
      return true;
    },
  );
});

test("identity errors win when expiry is also invalid", () => {
  assert.throws(
    () => adaptSession({ expiresAt: 1_700_000_000 }),
    (error) => {
      assertAdapterError(error, "SESSION_USER_REQUIRED", "Session userId is required");
      return true;
    },
  );
});

test("invalid expiresAt uses the expiry contract after identity succeeds", () => {
  assert.throws(
    () => adaptSession(validInput({ expiresAt: "not-a-timestamp" })),
    (error) => {
      assertAdapterError(error, "SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
      return true;
    },
  );
});

test("epoch seconds are not accepted as expiresAt", () => {
  assert.throws(
    () => adaptSession(validInput({ expiresAt: 1_700_000_000 })),
    (error) => {
      assertAdapterError(error, "SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
      return true;
    },
  );
});

test("expiresAt is returned as the original ISO-8601 string", () => {
  const expiresAt = "2026-12-01T00:00:00+00:00";
  const result = adaptSession(validInput({ expiresAt }));
  assert.equal(result.expiresAt, expiresAt);
  assert.equal(typeof result.expiresAt, "string");
});

test("an empty roles array is valid", () => {
  const result = adaptSession(validInput({ roles: [] }));
  assert.deepEqual(result.roles, []);
});

test("missing roles become an empty array", () => {
  const { roles: _roles, ...withoutRoles } = validInput();
  const result = adaptSession(withoutRoles);
  assert.deepEqual(result.roles, []);
});

test("duplicate roles are removed by first occurrence and input order is preserved", () => {
  const result = adaptSession(
    validInput({
      roles: ["editor", "admin", "editor", "reader", "admin"],
    }),
  );
  assert.deepEqual(result.roles, ["editor", "admin", "reader"]);
});

test("roles are not sorted alphabetically", () => {
  const result = adaptSession(validInput({ roles: ["zeta", "alpha", "mu"] }));
  assert.deepEqual(result.roles, ["zeta", "alpha", "mu"]);
});

test("does not rename userId to subject", () => {
  const result = adaptSession(validInput());
  assert.equal(result.userId, "user-42");
  assert.equal("subject" in result, false);
});

test("validation failures throw SessionAdapterError, not LegacySessionError", () => {
  try {
    adaptSession({});
    assert.fail("expected SessionAdapterError");
  } catch (error) {
    assert.equal(error.name, "SessionAdapterError");
    assert.notEqual(error.name, "LegacySessionError");
    assert.equal(error.constructor.name, "SessionAdapterError");
  }
});
