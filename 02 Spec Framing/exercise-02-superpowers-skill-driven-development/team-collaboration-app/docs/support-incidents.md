# Invitation Support Incidents

These incidents explain why a simple invite form is not enough.

## Duplicate membership

An administrator invited `IRIS@EXAMPLE.TEST` even though `iris@example.test` was already a member. The duplicate was discovered only after both identities appeared in an export.

## Policy bypass

A suspended owner and an active member both created invitations through an old internal helper. A guest was also invited while guest invitations were disabled.

## Reused invitation

An invitation was accepted twice from two browser tabs. Another invitation was accepted after its seven-day expiry date.

## Partial rejection

A rejected duplicate request still added an item to the pending list because validation happened after the array was changed.

The new workflow must reject these cases without changing the original invitation or member state.
