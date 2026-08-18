# Invoice Preview Rollback Drill

Source SHA: fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1

Command: `node scripts/rollback-invoice-preview.mjs --config <temporary-config> --actor release-engineer --reason "Invoice preview error rate exceeded rollback threshold" --timestamp 2026-08-14T10:30:00.000Z`

Start time: 2026-08-18T14:50:00.821Z
End time: 2026-08-18T14:50:00.841Z
Elapsed: 19.546 ms

## Before rollback

- Flag: enabled
- Revision: rollout-2026-08-14
- Experience: preview
- API calls: 1
- Telemetry events: 1, invoice_preview_viewed

## After rollback

- Flag: disabled
- Target allowlist: empty
- Revision: rollback-2026-08-14T10-30-00-000Z
- Previous revision: rollout-2026-08-14
- Experience: legacy
- API calls: 0
- Telemetry events: 0

Result: PASS. The rollback changed behavior without a deployment and completed within the 1000 ms objective.

Invalid-input check: PASS. An invalid timestamp returned non-zero and left the configuration unchanged.

Remaining cleanup: Remove invoice-preview-v2 and preview-specific telemetry after rollout retirement approval.
