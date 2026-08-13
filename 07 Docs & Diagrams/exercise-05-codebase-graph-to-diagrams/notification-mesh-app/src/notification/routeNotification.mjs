/** Seeded shortcut: provider availability is incorrectly treated as consent. */
export function selectNotificationRoute(input) {
  if (input.pushAvailable) return { channel: "push", durable: false };
  if (input.smsAvailable) return { channel: "sms", durable: false };
  return { channel: "queue", durable: true };
}
