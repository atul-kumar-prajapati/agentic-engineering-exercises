# Required Agent-Ready Card Schema

Every card must include: ID and title; reproduction or evidence; owner and reviewer; current state and state history; reserved paths and collision rule; focused verification command; acceptance and merge criteria; dependencies and merge order; rollback or cancellation instruction.

Valid states are `incoming`, `needs-info`, `triaged`, `ready-for-agent`, `ready-for-human`, `blocked`, `in-progress`, `in-review`, `merged`, `failed`, `rejected`, and `cancelled`.

A card is not agent-ready when evidence, ownership, path reservations, verification, or merge criteria are missing. Failed, rejected, and cancelled lanes must keep their state history and explain why no commit was integrated.
