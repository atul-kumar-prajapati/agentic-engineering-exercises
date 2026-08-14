import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { createConfigFlagClient } from "../src/rollout/configFlagClient.mjs";
import { loadInvoiceExperience } from "../src/rollout/invoicePreview.mjs";

export const FLAG_KEY = "invoice-preview-v2";

export function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function createObservations({ apiError = false } = {}) {
  const observations = { evaluations: [], apiCalls: [], telemetry: [] };
  return {
    observations,
    api: {
      async loadPreview(accountId) {
        observations.apiCalls.push({ accountId });
        if (apiError) throw new Error("Preview API unavailable");
        return { accountId, total: 42, currency: "USD" };
      },
    },
    telemetry: {
      emit(name, attributes) {
        observations.telemetry.push({ name, attributes: { ...attributes } });
      },
    },
  };
}

export async function executeScenario({ config, context, providerError = false, apiError = false }) {
  const dependencies = createObservations({ apiError });
  const flagClient = createConfigFlagClient(config, dependencies.observations, { providerError });
  const outcome = await loadInvoiceExperience({ flagClient, context: { ...context }, api: dependencies.api, telemetry: dependencies.telemetry });
  return { outcome, observations: dependencies.observations };
}

export function assertScenario(result, expected) {
  assert.equal(result.outcome.experience, expected.experience);
  assert.equal(result.outcome.reason ?? null, expected.reason);
  assert.equal(result.observations.apiCalls.length, expected.apiCalls);
  assert.deepEqual(result.observations.telemetry.map((event) => event.name), expected.telemetry);
}
