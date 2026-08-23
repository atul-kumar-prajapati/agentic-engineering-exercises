import assert from "node:assert/strict";
import { buttonVariantFor } from "../src/migration/exportButton.mjs";
import { checkoutButton, deleteButton, exportButton, legacyActionButton } from "../src/migration/actionButtons.mjs";

assert.equal(buttonVariantFor("export"), "ds-secondary", "export must use the new design-system variant");
assert.equal(buttonVariantFor("checkout"), "legacy-primary", "checkout is outside the migration slice");
assert.equal(buttonVariantFor("delete"), "legacy-danger", "destructive behavior is outside the migration slice");
for (const action of ["archive", "save", "unknown", ""]) assert.equal(buttonVariantFor(action), "legacy-primary", `${action || "empty"} must preserve the legacy fallback`);
assert.deepEqual(exportButton(), { action: "export", label: "Export report", variant: "ds-secondary" });
assert.deepEqual(checkoutButton(), { action: "checkout", label: "Continue to checkout", variant: "legacy-primary" });
assert.deepEqual(deleteButton(), { action: "delete", label: "Delete record", variant: "legacy-danger" });
assert.deepEqual(legacyActionButton("archive", "Archive"), { action: "archive", label: "Archive", variant: "legacy-primary" });
console.log("PASS export migrated to ds-secondary");
console.log("PASS real checkout, destructive, and unknown legacy consumers remain unchanged");
