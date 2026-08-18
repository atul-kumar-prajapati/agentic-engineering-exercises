import { emailAvailable, pushAvailable, smsAvailable } from "./channelProviders.mjs";
import { hasSmsConsent } from "./consentPolicy.mjs";
import { durableQueueRoute, immediateRoute } from "./routeResults.mjs";

/** SMS is selected only when the provider is available and consent is present. */
export function selectNotificationRoute(input) {
  if (pushAvailable(input)) return immediateRoute("push");
  if (smsAvailable(input) && hasSmsConsent(input)) return immediateRoute("sms");
  if (emailAvailable(input)) return immediateRoute("email");
  return durableQueueRoute();
}
