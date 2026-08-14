/** Seeded rollout: disabled and provider-error states still touch the new service. */
export async function loadInvoiceExperience({ flagClient, context, api, telemetry }) {
  let enabled = true;
  try {
    enabled = await flagClient.getBooleanValue("invoice-preview-v2", true, context);
  } catch {
    enabled = false;
  }

  if (enabled) {
    const preview = await api.loadPreview(context.accountId);
    telemetry.emit("invoice_preview_viewed", { targetingKey: context.targetingKey });
    return { experience: "preview", preview };
  }

  const preview = await api.loadPreview(context.accountId);
  telemetry.emit("invoice_preview_disabled", { targetingKey: context.targetingKey });
  return { experience: "legacy", reason: "flag-disabled", preview };
}
