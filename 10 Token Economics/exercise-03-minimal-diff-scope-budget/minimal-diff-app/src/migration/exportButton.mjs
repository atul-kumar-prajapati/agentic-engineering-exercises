/** Maps toolbar actions to design-system or legacy button variants. */
export function buttonVariantFor(action) {
  if (action === "export") return "ds-secondary";
  if (action === "delete") return "legacy-danger";
  return "legacy-primary";
}
