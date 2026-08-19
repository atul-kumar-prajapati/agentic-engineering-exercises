export class SessionAdapterError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SessionAdapterError";
    this.code = code;
  }
}

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

function isIsoTimestamp(value) {
  if (typeof value !== "string") {
    return false;
  }
  if (!ISO_TIMESTAMP.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];
  for (const role of roles) {
    if (seen.has(role)) {
      continue;
    }
    seen.add(role);
    normalized.push(role);
  }
  return normalized;
}

export function adaptSession(input) {
  const payload = input !== null && typeof input === "object" ? input : {};

  const userId = payload.userId;
  if (typeof userId !== "string" || userId.length === 0) {
    throw new SessionAdapterError(
      "SESSION_USER_REQUIRED",
      "Session userId is required",
    );
  }

  if (!isIsoTimestamp(payload.expiresAt)) {
    throw new SessionAdapterError(
      "SESSION_EXPIRY_INVALID",
      "Session expiresAt must be an ISO timestamp",
    );
  }

  return {
    userId,
    roles: normalizeRoles(payload.roles),
    expiresAt: payload.expiresAt,
  };
}
