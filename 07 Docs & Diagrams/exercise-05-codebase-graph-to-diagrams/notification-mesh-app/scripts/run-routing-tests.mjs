import assert from "node:assert/strict";
import { selectNotificationRoute } from "../src/notification/routeNotification.mjs";

const checks = [
  ["healthy push remains primary", () => assert.deepEqual(selectNotificationRoute({ pushAvailable: true, smsAvailable: true, smsConsent: true, emailAvailable: true }), { channel: "push", durable: false })],
  ["consented SMS is the first fallback", () => assert.deepEqual(selectNotificationRoute({ pushAvailable: false, smsAvailable: true, smsConsent: true, emailAvailable: true }), { channel: "sms", durable: false })],
  ["SMS without consent falls back to email", () => assert.deepEqual(selectNotificationRoute({ pushAvailable: false, smsAvailable: true, smsConsent: false, emailAvailable: true }), { channel: "email", durable: false })],
  ["no permitted provider creates durable work", () => assert.deepEqual(selectNotificationRoute({ pushAvailable: false, smsAvailable: true, smsConsent: false, emailAvailable: false }), { channel: "queue", durable: true })],
];

let failed = 0;
for (const [name, check] of checks) {
  try { check(); console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
if (failed) process.exit(1);
