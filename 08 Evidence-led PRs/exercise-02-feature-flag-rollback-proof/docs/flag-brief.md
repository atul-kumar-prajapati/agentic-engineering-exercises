# Invoice Preview Flag Contract

Flag key: `invoice-preview-v2`.

Evaluation requirements:

- Call `flagClient.getBooleanValue(flagKey, false, context)` exactly once for a valid request.
- Pass both `targetingKey` and `accountId` unchanged. They must be equal, non-empty strings.
- Treat a disabled result or evaluation exception as disabled.
- Return `{ experience: "legacy", reason: <reason> }` for every non-enabled result.

Side-effect requirements:

- Only an enabled result may call `api.loadPreview(accountId)`.
- Emit `invoice_preview_viewed` only after a successful API response.
- The telemetry payload contains the unchanged `targetingKey`, `accountId`, and `flagKey`.
- If the preview API fails, return legacy with reason `preview-unavailable` and emit no preview telemetry.

Required legacy reasons are `invalid-context`, `flag-disabled`, `flag-evaluation-error`, and `preview-unavailable`.
