import assert from "node:assert/strict";
import { buttonVariantFor } from "../src/migration/exportButton.mjs";
assert.equal(buttonVariantFor("export"), "ds-secondary", "export must use the new design-system variant");
assert.equal(buttonVariantFor("checkout"), "legacy-primary", "checkout is outside the migration slice");
assert.equal(buttonVariantFor("delete"), "legacy-danger", "destructive behavior is outside the migration slice");
console.log("Export migrated while checkout and destructive variants remain unchanged.");
