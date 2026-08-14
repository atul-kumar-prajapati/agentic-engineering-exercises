# Quality Gate Brief

Audit the production build at route `/` in Chrome.

The release passes only when all requirements hold:

- Exactly three Lighthouse reports use one route and browser environment.
- Worst performance score is at least `0.90`.
- Worst Lighthouse accessibility score is `1.00`.
- Worst largest contentful paint is at most `2500 ms`.
- The axe browser scan contains zero violations.
- Every Lighthouse assertion uses error severity and pessimistic aggregation.

The gate must reject one bad run even when the other two pass. Do not use `skipAudits`, change the protected thresholds, or replace raw browser output with a manual summary.

The starter has two measured defects: first render is deliberately delayed and an icon-only action has no accessible name. Preserve the dashboard's behavior while fixing them.
