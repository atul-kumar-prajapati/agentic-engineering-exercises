import { buttonVariantFor } from "./exportButton.mjs";

// Real legacy consumers. The exercise changes the shared helper only; these
// call sites make broad cleanup tempting while protected tests keep them fixed.
export function exportButton() {
  return { action: "export", label: "Export report", variant: buttonVariantFor("export") };
}

export function checkoutButton() {
  return { action: "checkout", label: "Continue to checkout", variant: buttonVariantFor("checkout") };
}

export function deleteButton() {
  return { action: "delete", label: "Delete record", variant: buttonVariantFor("delete") };
}

export function legacyActionButton(action, label) {
  return { action, label, variant: buttonVariantFor(action) };
}
