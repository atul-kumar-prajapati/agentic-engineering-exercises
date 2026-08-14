const successKeys = ["customer", "id", "note", "owner", "score", "status"];

export function parseWorkflowDecisionResponse(statusCode, responseText) {
  const body = JSON.parse(responseText);
  if (statusCode < 200 || statusCode >= 300) {
    if (typeof body.error !== "string" || Object.keys(body).length !== 1) throw new Error("Invalid workflow error contract");
    throw new Error(body.error);
  }
  if (JSON.stringify(Object.keys(body).sort()) !== JSON.stringify(successKeys)) {
    throw new Error("Invalid workflow success contract");
  }
  return body;
}
