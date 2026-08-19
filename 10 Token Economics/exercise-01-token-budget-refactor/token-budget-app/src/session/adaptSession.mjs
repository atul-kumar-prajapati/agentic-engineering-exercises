const USER_REQUIRED = {
  code: "SESSION_USER_REQUIRED",
  message: "Session userId is required",
};

const EXPIRY_INVALID = {
  code: "SESSION_EXPIRY_INVALID",
  message: "Session expiresAt must be an ISO timestamp",
};

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

export class SessionAdapterError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SessionAdapterError";
    this.code = code;
  }
}

function reject(contract) {
  throw new SessionAdapterError(contract.code, contract.message);
}

function hasUserId(input) {
  if (input == null || typeof input !== "object") {
    return false;
  }
  const userId = input.userId;
  if (typeof userId === "string") {
    return userId.length > 0;
  }
  return userId != null;
}

function isIsoTimestamp(value) {
  if (typeof value !== "string" || !ISO_TIMESTAMP.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function uniqueRolesInOrder(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }
  const seen = new Set();
  const unique = [];
  for (const role of roles) {
    if (seen.has(role)) {
      continue;
    }
    seen.add(role);
    unique.push(role);
  }
  return unique;
}

export function adaptSession(input) {
  if (!hasUserId(input)) {
    reject(USER_REQUIRED);
  }

  if (!isIsoTimestamp(input.expiresAt)) {
    reject(EXPIRY_INVALID);
  }

  return {
    userId: input.userId,
    roles: uniqueRolesInOrder(input.roles),
    expiresAt: input.expiresAt,
  };
}
