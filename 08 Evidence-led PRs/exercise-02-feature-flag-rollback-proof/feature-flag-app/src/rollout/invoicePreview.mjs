const FLAG_KEY = "invoice-preview-v2";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTargetingContext(context) {
  return Boolean(context && isNonEmptyString(context.targetingKey) && isNonEmptyString(context.accountId));
}

function legacy(reason) {
  return { experience: "legacy", reason };
}

/**
 * Provider-independent invoice preview boundary.
 * Fail closed: invalid context, provider errors, disabled flags, and preview
 * API failures all return legacy behavior with no preview I/O or telemetry.
 */
export async function loadInvoiceExperience({ flagClient, context, api, telemetry }) {
  if (!isValidTargetingContext(context)) {
    return legacy("invalid-context");
  }

  let enabled = false;
  try {
    enabled = await flagClient.getBooleanValue(FLAG_KEY, false, context);
  } catch {
    return legacy("provider-error");
  }

  if (enabled !== true) {
    return legacy("flag-disabled");
  }

  let preview;
  try {
    preview = await api.loadPreview(context.accountId);
  } catch {
    return legacy("api-error");
  }

  telemetry.emit("invoice_preview_viewed", {
    targetingKey: context.targetingKey,
    accountId: context.accountId,
    flagKey: FLAG_KEY,
  });

  return { experience: "preview", preview };
}
