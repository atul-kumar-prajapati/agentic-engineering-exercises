# Legacy Route Map

The starter router sends every request to `implementations.legacy`. The refactor boundary is deliberately limited to the `card` decision.

| Payment type | Flag on | Flag off |
|---|---|---|
| card | new card slice | legacy |
| gift-card | legacy | legacy |
| invoice | legacy | legacy |
| unknown | legacy | legacy |

Keep the legacy function injectable and callable. Removing it breaks rollback and the safe pre-authorization fallback.
