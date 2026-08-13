# Proving Change: Saved Owner Filter

Add persistence for a saved work-queue filter. Store the selected owner's stable ID, normalize the status to the canonical lower-case value, and use the caller-provided clock for `updatedAt`.

Do not store display labels and do not call the system clock inside business logic. Use the existing persistence boundary and add focused tests.
