const FLAG_KEY = "invoice-preview-v2";

function isValidContext(context) {
  const targetingKey = context?.targetingKey;
  const accountId = context?.accountId;
  return (
    typeof targetingKey === "string"
    && typeof accountId === "string"
    && targetingKey.length > 0
    && accountId.length > 0
    && targetingKey === accountId
  );
}

export async function loadInvoiceExperience({ flagClient, context, api, telemetry }) {
  if (!isValidContext(context)) {
    return { experience: "legacy", reason: "invalid-context" };
  }

  let enabled = false;
  try {
    enabled = await flagClient.getBooleanValue(FLAG_KEY, false, context);
  } catch {
    return { experience: "legacy", reason: "flag-evaluation-error" };
  }

  if (!enabled) {
    return { experience: "legacy", reason: "flag-disabled" };
  }

  let preview;
  try {
    preview = await api.loadPreview(context.accountId);
  } catch {
    return { experience: "legacy", reason: "preview-unavailable" };
  }

  telemetry.emit("invoice_preview_viewed", {
    targetingKey: context.targetingKey,
    accountId: context.accountId,
    flagKey: FLAG_KEY,
  });
  return { experience: "preview", preview };
}
