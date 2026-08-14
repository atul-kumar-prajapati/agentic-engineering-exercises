import assert from "node:assert/strict";
import { validateRouteMatrix } from "./strangler-verification.mjs";

const complete = "card new slice; gift-card legacy; invoice legacy; unknown legacy; flag off legacy; pre-authorization fallback; ambiguous no fallback";
assert.deepEqual(validateRouteMatrix(complete), []);
assert.ok(validateRouteMatrix("card only").length > 0);
console.log("strangler submission verifier self-test passed");
