import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adaptSession, SessionAdapterError } from "./adaptSession.mjs";

const VALID_EXPIRY = "2026-08-19T09:21:00.000Z";

function validInput(overrides = {}) {
  return {
    userId: "user-1",
    roles: ["reader"],
    expiresAt: VALID_EXPIRY,
    ...overrides,
  };
}

describe("adaptSession", () => {
  it("returns userId, roles, and expiresAt from a current session payload", () => {
    const result = adaptSession(
      validInput({ roles: ["admin", "reader"] }),
    );

    assert.deepEqual(result, {
      userId: "user-1",
      roles: ["admin", "reader"],
      expiresAt: VALID_EXPIRY,
    });
  });

  it("ignores unknown input fields", () => {
    const result = adaptSession(
      validInput({
        displayName: "Ada",
        locale: "en-US",
        extraFlag: true,
      }),
    );

    assert.deepEqual(Object.keys(result).sort(), [
      "expiresAt",
      "roles",
      "userId",
    ]);
    assert.equal("displayName" in result, false);
    assert.equal("locale" in result, false);
    assert.equal("extraFlag" in result, false);
  });

  it("preserves role order and removes duplicates by first occurrence", () => {
    const result = adaptSession(
      validInput({ roles: ["billing", "admin", "billing", "reader", "admin"] }),
    );

    assert.deepEqual(result.roles, ["billing", "admin", "reader"]);
  });

  it("accepts an empty roles array", () => {
    const result = adaptSession(validInput({ roles: [] }));
    assert.deepEqual(result.roles, []);
  });

  it("treats missing roles as an empty array after identity and expiry checks", () => {
    const result = adaptSession({
      userId: "user-1",
      expiresAt: VALID_EXPIRY,
    });
    assert.deepEqual(result.roles, []);
  });

  it("returns expiresAt as the original ISO-8601 string", () => {
    const expiresAt = "2026-12-01T15:04:05+05:30";
    const result = adaptSession(validInput({ expiresAt }));
    assert.equal(result.expiresAt, expiresAt);
    assert.equal(typeof result.expiresAt, "string");
  });

  it("is synchronous", () => {
    const result = adaptSession(validInput());
    assert.equal(typeof result.then, "undefined");
  });

  it("throws SessionAdapterError with SESSION_USER_REQUIRED when userId is missing", () => {
    assert.throws(
      () => adaptSession({ roles: ["admin"], expiresAt: VALID_EXPIRY }),
      (error) => {
        assert.ok(error instanceof SessionAdapterError);
        assert.equal(error.code, "SESSION_USER_REQUIRED");
        assert.equal(error.message, "Session userId is required");
        return true;
      },
    );
  });

  it("rejects missing userId before role normalization", () => {
    const roles = ["admin", "admin", "reader"];
    assert.throws(
      () => adaptSession({ roles, expiresAt: VALID_EXPIRY }),
      (error) => error instanceof SessionAdapterError && error.code === "SESSION_USER_REQUIRED",
    );
    assert.deepEqual(roles, ["admin", "admin", "reader"]);
  });

  it("throws SessionAdapterError with SESSION_EXPIRY_INVALID for a non-ISO expiry", () => {
    assert.throws(
      () => adaptSession(validInput({ expiresAt: "next-week" })),
      (error) => {
        assert.ok(error instanceof SessionAdapterError);
        assert.equal(error.code, "SESSION_EXPIRY_INVALID");
        assert.equal(error.message, "Session expiresAt must be an ISO timestamp");
        return true;
      },
    );
  });

  it("validates identity before expiry and expiry before roles", () => {
    assert.throws(
      () =>
        adaptSession({
          expiresAt: "not-iso",
          roles: ["admin", "admin"],
        }),
      (error) =>
        error instanceof SessionAdapterError &&
        error.code === "SESSION_USER_REQUIRED",
    );

    assert.throws(
      () =>
        adaptSession({
          userId: "user-1",
          expiresAt: "not-iso",
          roles: ["admin", "admin"],
        }),
      (error) =>
        error instanceof SessionAdapterError &&
        error.code === "SESSION_EXPIRY_INVALID",
    );
  });
});
