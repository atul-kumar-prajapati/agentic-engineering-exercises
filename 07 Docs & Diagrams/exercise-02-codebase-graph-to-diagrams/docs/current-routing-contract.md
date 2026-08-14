# Current Notification Routing Contract

For an opted-in customer, use push when the push provider is healthy. If push is unavailable, SMS may be used only when the customer has explicit SMS consent and the SMS provider is healthy. Otherwise use email when available. If no permitted provider is available, enqueue one durable notification for later delivery.

Never select more than one immediate channel. Provider availability does not override customer consent.
