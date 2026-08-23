# Routing Policy Contract

Apply rules in this order:

1. Return `clarify` when risk is missing or unknown, ambiguity is high, or scope is unknown.
2. Return `reasoning` for high risk or cross-boundary scope.
3. Return `balanced` for medium risk or a three-file scope.
4. Return `fast` only for low-risk, low-ambiguity work with one-file or mechanical scope.
5. Return `clarify` for any unrecognized field combination.

The first matching rule wins. A cheaper tier never overrides clarification or high-risk safety. A failed fast call escalates once to balanced. A failed balanced call escalates once to reasoning. Reasoning has no cheaper fallback.
