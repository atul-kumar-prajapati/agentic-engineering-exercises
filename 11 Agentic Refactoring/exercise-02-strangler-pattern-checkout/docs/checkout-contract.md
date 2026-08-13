# Checkout Strangler Contract

Card requests must use the new card implementation. Gift-card and invoice requests must continue through the legacy implementation. The router must expose one seam that tests can replace with fakes.

All routes preserve the public result fields `orderId`, `status`, `totalCents`, and `errorCode`. A new-card failure falls back only when no external authorization was created; otherwise it returns the established error without retrying through legacy checkout.
