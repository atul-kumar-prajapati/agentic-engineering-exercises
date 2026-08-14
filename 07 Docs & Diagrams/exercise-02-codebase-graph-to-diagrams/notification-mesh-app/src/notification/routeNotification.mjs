import { emailAvailable, pushAvailable, smsAvailable } from "./channelProviders.mjs";
import { hasSmsConsent } from "./consentPolicy.mjs";
import { durableQueueRoute, immediateRoute } from "./routeResults.mjs";

/** Seeded shortcut: provider availability is incorrectly treated as consent. */
export function selectNotificationRoute(input) {
  if (pushAvailable(input)) return immediateRoute("push");
  if (smsAvailable(input)) return immediateRoute("sms");
  if (emailAvailable(input)) return immediateRoute("email");
  return durableQueueRoute();
}
