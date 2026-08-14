import assert from "node:assert/strict";
import { buttonVariantFor } from "../src/migration/exportButton.mjs";

assert.equal(buttonVariantFor("export"), "ds-secondary", "export must use the new design-system variant");
assert.equal(buttonVariantFor("checkout"), "legacy-primary", "checkout is outside the migration slice");
assert.equal(buttonVariantFor("delete"), "legacy-danger", "destructive behavior is outside the migration slice");
for (const action of ["archive", "save", "unknown", ""]) assert.equal(buttonVariantFor(action), "legacy-primary", `${action || "empty"} must preserve the legacy fallback`);
console.log("PASS export migrated to ds-secondary");
console.log("PASS checkout, destructive, and unknown legacy variants remain unchanged");
