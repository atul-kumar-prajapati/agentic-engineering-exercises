/** Seeded implementation: export has not yet crossed the design-system boundary. */
export function buttonVariantFor(action) {
  if (action === "delete") return "legacy-danger";
  return "legacy-primary";
}
