# Independent Diff Triage — Fresh Review Report

- **Session:** fresh-09-02-opencode-glm53-20260819 (contextMode: fresh)
- **Reviewer:** opencode subagent (general) running glm-5.3 (opencode-go/glm-5.3)
- **Range:** review-base..review-head
- **Base SHA:** 8911d1064f74bdc7f0d4e88a2e57f122830ef6f2
- **Head SHA:** 8242a84ad8735d1a9c5051e1916d86c1c95101af
- **Inputs:** docs/review-brief.md, fixtures/manifest.json, pr/review-target.diff, plus the mounted head source for reproduction
- **Excluded context:** docs/implementer-notes.md, earlier reviews, expected finding IDs, implementation chat
- **Merge decision:** Request changes

## Summary

The patch introduces a localStorage cache for workflow items. Traced against the exact head commit, it violates all four acceptance boundaries in the review brief: saved work does not survive filtering or reload, damaged cache data is trusted instead of falling back, the default sort mutates the shared fixture in place, and evidence collection writes stale state during a read-only action. Four blockers, all reproduced against the mounted head. The seeded claim that `saveAction` mutates the shared fixture was evaluated and dismissed with code evidence.

## CACHE-001 — Filter changes (and every mount) delete cached workflow state (blocker, high)

- **Trigger:** save an owner/status/note, then change the priority or status filter, or reload (the effect also runs on mount).
- **Impact:** the effect at `src/App.tsx:40-42` calls `clearCachedWorkflowItems()` on every filter change and on mount, erasing any persisted workflow cache. Saved work is destroyed by an unrelated read-only UI action, so "saved must survive filtering and reload" is structurally unachievable.
- **Location:** `src/App.tsx:41` (head), calling `src/services/workflowApi.ts:16-18`.
- **Confidence:** high. **Decision:** fix — remove the effect and the import.

## CACHE-002 — Unguarded cached JSON: crash or hang instead of fallback (blocker, high)

- **Trigger:** `localStorage["workflow-items"]` holds malformed JSON (`{broken`) or non-array JSON (`{"id":"not-an-array"}`).
- **Impact:** `JSON.parse` at `src/services/workflowApi.ts:10` throws with no try/catch, so `fetchWorkItems` rejects and the app never leaves the loading screen; a non-array value is blindly cast and returned, breaking every caller. Damaged browser data must fall back safely, not strand the app.
- **Location:** `src/services/workflowApi.ts:8-11` (head).
- **Confidence:** high. **Decision:** fix — parse defensively, validate `Array.isArray`, discard the bad entry, fall back to defaults.

## CACHE-003 — Default sort mutates the shared fixture in place (blocker, medium)

- **Trigger:** `fetchWorkItems` on the cache-miss path (every fresh load).
- **Impact:** `workItems.sort(...)` at `src/services/workflowApi.ts:13` sorts the module-level exported array in place and returns the live shared reference, so the imported fixture does not remain unchanged and callers can leak mutations into later sessions.
- **Location:** `src/services/workflowApi.ts:13` (head).
- **Confidence:** high. **Decision:** fix — return `[...workItems].sort(...)`.

## CACHE-004 — Evidence collection writes stale state to the cache (blocker, high)

- **Trigger:** click collect evidence on any item while cached workflow state exists.
- **Impact:** `src/services/workflowApi.ts:37` writes `JSON.stringify(workItems)` into the workflow-items key during a read-only action, clobbering real cached state with a stale snapshot of the never-updated fixture; later loads serve that stale state.
- **Location:** `src/services/workflowApi.ts:37` (head).
- **Confidence:** high. **Decision:** fix — remove the write entirely.

## CLAIM-001 — "saveAction mutates the shared workItems fixture in place" — dismissed (unsupported, info)

**Dismissed.** The claim is not supported by the code in the comparison range. `saveAction` only *reads* `workItems` — `workItems.find(...)` at `src/services/workflowApi.ts:22` — and returns a **new object** built by spread at lines 27-32:

```ts
const item = workItems.find((candidate) => candidate.id === itemId);
...
return { ...item, status: draft.status, owner: draft.owner, note: draft.note };
```

There is no index assignment, no `splice`, no replacement of array elements, and no storage write inside `saveAction` at the head, so the shared fixture is never permanently changed by a save. The genuine reload data loss comes from CACHE-001 (the destructive filter effect) combined with the absence of any persistence write — not from in-place mutation. The claim resembles the real nearby bug in CACHE-003 (in-place *sort* in `fetchWorkItems`), which is exactly why it sounds credible, but it does not hold against the exact comparison range.

## Decision

**Request changes.** All four cache blockers are merge blockers: they break the four acceptance boundaries of the review brief (persistence across filtering/reload, safe fallback on damaged data, immutable fixture, read-only evidence collection). The remediation for each is a focused, minimal fix; the dismissed claim requires no change.
