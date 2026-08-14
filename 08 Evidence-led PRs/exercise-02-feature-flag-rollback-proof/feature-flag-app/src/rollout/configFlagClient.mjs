export function createConfigFlagClient(config, observations, { providerError = false } = {}) {
  return {
    async getBooleanValue(flagKey, defaultValue, context) {
      observations.evaluations.push({ flagKey, defaultValue, context: { ...context } });
      if (providerError) throw new Error("Feature flag provider unavailable");
      if (flagKey !== config.flagKey) return defaultValue;
      return config.enabled === true && config.allowlist.includes(context.targetingKey);
    },
  };
}
