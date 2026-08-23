export class SessionAdapterError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SessionAdapterError";
    this.code = code;
  }
}

function validIsoTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  const canonical = value.includes(".") ? value : value.replace("Z", ".000Z");
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === canonical;
}

/** Working but deliberately monolithic legacy adapter for the refactor task. */
export function adaptSession(input) {
  if (!input || typeof input.userId !== "string" || input.userId.trim() === "") {
    throw new SessionAdapterError("SESSION_USER_REQUIRED", "Session userId is required");
  }
  if (!validIsoTimestamp(input.expiresAt)) {
    throw new SessionAdapterError("SESSION_EXPIRY_INVALID", "Session expiresAt must be an ISO timestamp");
  }
  if (!Array.isArray(input.roles) || input.roles.some((role) => typeof role !== "string" || role.trim() === "")) {
    throw new SessionAdapterError("SESSION_ROLES_INVALID", "Session roles must be an array of non-empty strings");
  }
  const roles = [];
  for (const role of input.roles) if (!roles.includes(role)) roles.push(role);
  return { userId: input.userId, roles, expiresAt: input.expiresAt };
}
