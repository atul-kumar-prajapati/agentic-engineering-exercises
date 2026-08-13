/** Seeded rollout: disabled and provider-error states still touch the new service. */
export async function loadInvoiceExperience({ enabled, evaluationError, context, api, telemetry }) {
  if (enabled && !evaluationError) {
    const preview = await api.loadPreview(context.accountId);
    telemetry.emit("invoice_preview_viewed", { targetingKey: context.targetingKey });
    return { experience: "preview", preview };
  }
  const preview = await api.loadPreview(context.accountId);
  telemetry.emit("invoice_preview_disabled", { targetingKey: context.targetingKey });
  return { experience: "legacy", preview };
}
