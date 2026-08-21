import assert from "node:assert/strict";
import { buttonVariantFor } from "../src/migration/exportButton.mjs";

assert.equal(buttonVariantFor("export"), "ds-secondary");
assert.equal(buttonVariantFor("checkout"), "legacy-primary");
assert.equal(buttonVariantFor("delete"), "legacy-danger");
assert.equal(buttonVariantFor("unknown"), "legacy-primary");

console.log("PASS export-button variants");
