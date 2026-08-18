# Accountable Integration Notes

The main agent retained ownership of integration, source binding, evidence generation, verification, commits, and push scope.

## Prioritization

1. Preserve the two independent first attempts before applying review feedback.
2. Accept only diagram behavior supported by protected source or trace output.
3. Record contradictions instead of editing protected workflow inputs.
4. Freeze reviewed diagrams in a dedicated source commit before adding evidence.

## Dispositions

- Accepted: all ten source-led diagram mappings and all Mermaid semantic structures.
- Implemented: exact traceability records, four legacy contradictions, the UI projection contradiction, before/after comparison, specialist scope and handoffs, command capture, and hash manifest.
- Rejected: the legacy automatic retry, direct-to-data-owner high-risk route, outside-application security claim, and omission of rollback ownership.
- Deferred: correcting `completedStagesByStatus` because `src/workflow.tsx` is protected and the exercise requires the conflict to remain visible.

No specialist had overlapping write ownership. Diagram authors were isolated by branch and scope; reviewers were read-only. The final branch contains only the source-led diagrams and evidence, while the legacy attempt remains independently inspectable on its before branch.

## Round-Two Dispositions

Three independent read-only specialists re-audited the frozen artifacts. Handoffs are in `evidence/specialists/round2-*.md`. The integration owner verified every claim against source and the verifier before acting, and rejected one.

| Finding | Lane | Disposition |
| --- | --- | --- |
| `CODE-01` scope understated — `security-review` is completed for six statuses, not one | Provenance | **Implemented** in `contradictions.md` |
| `buildFlowSteps` renders all ten stages for every request | Provenance | **Implemented** — folded into `CODE-01` as the same UI-projection contradiction, so the required count stays at five |
| `access-failure-sequence.mmd:17` invented an identity-admin assignment under `WF-09` | Provenance | **Implemented** — replaced with `Mark identity provider degraded`, backed by `workflow.tsx:129` |
| `else Normal risk` branch left the PolicyEngine call unanswered | Semantics | **Implemented** — reply added before the `WF-04` marker |
| `WF-04` arrow direction differs from the high-risk branch | Semantics + Provenance | **Rejected** — the two are different transitions, and the file consistently makes the traced actor the sender of each marker's first message |
| Evidence phrases three protected scenarios as four traces | Provenance | **Implemented** — wording corrected in `verification.md` |
| Failure-diagram strings pass only via case-insensitive comparison | Semantics | **Deferred** — informational; changing it would not improve accuracy and the contract sets no `caseSensitive` flag |
| `before.md` reworded across branches; patches whitespace-normalised | Integrity | **Deferred** — content faithful, every recorded condition and measurement preserved |

Prioritisation: accuracy defects that made the diagrams claim unsupported behaviour ranked first, then evidence statements that overstated scope, then wording. Nothing was changed that the exercise requirements and specialist evidence did not support, and no protected input was modified.

Ordering constraint honoured: `scripts/diagram-verification.mjs:211-216` requires every commit after `source_sha` to touch only `evidence/`, and lines 255-259 require the diagrams to be byte-identical to their `source_sha` version. The corrected diagrams were therefore committed first as `63601a3662358da499f72118fd4d693bcfc530da`, both command outputs were re-captured while `HEAD` equalled that commit, and all manifest hashes were recomputed before the evidence-only commit.
