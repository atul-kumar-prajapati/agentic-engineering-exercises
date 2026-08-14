# Legacy Behavior Notes

Treat the golden file as observations, not desired product policy.

Preserve exact output shape and strings. Pay special attention to the 12-month and 6-month boundaries, two-late-payment threshold, support override precedence, zero discount on override, negative late-payment acceptance, and `plan-not-supported` on otherwise mature accounts.

Record questionable behavior as a suspected bug for a separate approved change. Do not add validation or change precedence during this structural refactor.
